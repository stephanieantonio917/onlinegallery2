import { useEffect, useState } from "react";
import supabase from "../supabaseClient";
import PaintingCard from "../components/PaintingCard";
import "./HomePage.css";

export default function HomePage() {
  const [paintings, setPaintings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaintings = async () => {
      console.log("Supabase URL:", import.meta.env.VITE_SUPABASE_URL); // Debug

      const { data, error } = await supabase.from("paintings").select("*");

      if (error) {
        console.error("❌ Error loading paintings:", error.message);
        setPaintings([]);
      } else {
        setPaintings(data || []);
      }

      setLoading(false);
    };

    fetchPaintings();
  }, []);

  return (
    <div className="home-page">
      <h1 className="page-title">🎨 All Paintings</h1>

      {loading ? (
        <p>Loading paintings...</p>
      ) : paintings.length === 0 ? (
        <p>No paintings found.</p>
      ) : (
        <div className="gallery-grid">
          {paintings.map((p) => (
            <PaintingCard key={p.painting_id} painting={p} />
          ))}
        </div>
      )}
    </div>
  );
}
