import { useEffect, useState } from "react";
import supabase from "../supabaseClient";

// Inline form component (you can move this to components/ if you want later)
function CreateOrderForm({ onOrderCreated }) {
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

    const { error: itemError } = await supabase
      .from("order_items")
      .insert([{ order_id: order.order_id, painting_id: form.painting_id, quantity: form.quantity }]);

    if (itemError) {
      console.error("❌ Failed to create order item:", itemError.message);
    } else {
      alert("✅ Order created!");
      if (onOrderCreated) onOrderCreated();
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

// Orders page with order list
export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrdersWithItems = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("order_id, status, created_at, order_items:order_id(painting:painting_id(title, image_url))")
      .order("created_at", { ascending: false });

    if (!error) setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrdersWithItems();
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>📦 Orders</h1>

      {/* Embedded form */}
      <CreateOrderForm onOrderCreated={fetchOrdersWithItems} />

      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {orders.map((order) => (
            <div
              key={order.order_id}
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "1rem",
                backgroundColor: "#fafafa",
              }}
            >
              <h3>Order ID: {order.order_id}</h3>
              <p><strong>Status:</strong> {order.status}</p>
              <p><strong>Date:</strong> {new Date(order.created_at).toLocaleString()}</p>

              {order.order_items?.length > 0 ? (
                <div style={{ marginTop: "1rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                  {order.order_items.map((item, index) => (
                    <div key={index} style={{ textAlign: "center" }}>
                      <img
                        src={item.painting?.image_url}
                        alt={item.painting?.title}
                        width={150}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/fallback.jpg";
                        }}
                      />
                      <p>{item.painting?.title}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p><em>No paintings found for this order.</em></p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
