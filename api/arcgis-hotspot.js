export default async function handler(req, res) {
  try {
    const url = "https://opsroom.sipongidata.my.id/api/opsroom/indoHotspot?wilayah=IN&late=24&confidence[]=low&confidence[]=medium&confidence[]=high";

    const response = await fetch(url);
    const json = await response.json();

    let raw = json.data || [];

    let features = raw
      .filter(d => d.latitude && d.longitude)
      .map((d) => ({
        type: "Feature",
        properties: {
          confidence: d.confidence || "unknown",
          brightness: Number(d.brightness) || 0
        },
        geometry: {
          type: "Point",
          coordinates: [
            Number(d.longitude),
            Number(d.latitude)
          ]
        }
      }));

    // 🔥 kalau kosong → kasih dummy point
    if (features.length === 0) {
      features = [
        {
          type: "Feature",
          properties: {
            note: "no data"
          },
          geometry: {
            type: "Point",
            coordinates: [110, -2]
          }
        }
      ];
    }

    res.status(200).json({
      type: "FeatureCollection",
      features
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
