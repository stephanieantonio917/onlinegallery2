import { useEffect, useState } from "react";
import supabase from "../supabaseClient";

export default function CreateOrderForm({ onOrderCreated }) {
  const [users, setUsers] = useState([]);
  const [paintings, setPaintings] = useState([]);
  const [form, setForm] = useState({
    user_id: "",
    painting_id: "",
    quantity: 1,
    status: "processing",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDropdowns();
  }, []);

  async function loadDropdowns() {
    const [{ data: usersData }, { data: paintingsData }] = await Promise.all([
      supabase.from("users").select("user_id, full_name"),
      supabase.from("paintings").select("painting_id, title"),
    ]);
    setUsers(usersData || []);
    setPaintings(paintingsData || []);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    // Step 1: Insert into orders
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([{ user_id: form.user_id, status: form.status }])
      .select()
      .single();

    if (orderError) {
      console.error("❌ Failed to create order:", orderError.message);
      setLoading(false);
      return;
    }

    // Step 2: Insert into order_items
    const { error: itemError } = await supabase
      .from("order_items")
      .insert([{ order_id: order.order_id, painting_id: form.painting_id, quantity: form.quantity }]);

    if (itemError) {
      console.error("❌ Failed to create order item:", itemError.message);
    } else {
      alert("✅ Order created!");
      if (onOrderCreated) onOrderCreated(); // refetch orders in parent
      setForm({ user_id: "", painting_id: "", quantity: 1, status: "processing" });
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} style={{ padding: "1rem", border: "1px solid #ccc", borderRadius: "8px", marginBottom: "2rem" }}>
      <h2>Create New Order</h2>

      <label>User:</label>
      <select
        value={form.user_id}
        onChange={(e) => setForm({ ...form, user_id: e.target.value })}
        required
      >
        <option value="">-- Select User --</option>
        {users.map((user) => (
          <option key={user.user_id} value={user.user_id}>
            {user.full_name}
          </option>
        ))}
      </select>

      <label style={{ marginTop: "1rem" }}>Painting:</label>
      <select
        value={form.painting_id}
        onChange={(e) => setForm({ ...form, painting_id: e.target.value })}
        required
      >
        <option value="">-- Select Painting --</option>
        {paintings.map((p) => (
          <option key={p.painting_id} value={p.painting_id}>
            {p.title}
          </option>
        ))}
      </select>

      <label style={{ marginTop: "1rem" }}>Quantity:</label>
      <input
        type="number"
        min="1"
        value={form.quantity}
        onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) })}
        required
      />

      <label style={{ marginTop: "1rem" }}>Status:</label>
      <select
        value={form.status}
        onChange={(e) => setForm({ ...form, status: e.target.value })}
      >
        <option value="processing">Processing</option>
        <option value="shipped">Shipped</option>
      </select>

      <br />
      <button type="submit" disabled={loading} style={{ marginTop: "1rem" }}>
        {loading ? "Submitting..." : "Create Order"}
      </button>
    </form>
  );
}
