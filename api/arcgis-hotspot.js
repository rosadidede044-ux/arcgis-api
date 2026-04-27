export default async function handler(req, res) {
  try {
    // ambil parameter dari URL (opsional)
    const confidence = req.query.confidence || "low,medium,high";
    const late = req.query.late || "24";

    // bikin URL ke API SiPongi
    const url = `https://opsroom.sipongidata.my.id/api/opsroom/indoHotspot?wilayah=IN&late=${late}&confidence[]=${confidence}`;

    const response = await fetch(url);
    const json = await response.json();

    const raw = json.data || [];

    const features = raw
      .filter(d => d.latitude && d.longitude)
      .map((d) => ({
        type: "Feature",
        properties: {
          confidence: d.confidence || "unknown",
          satellite: d.satelit || "unknown",
          brightness: Number(d.brightness) || 0,
          provinsi: d.provinsi || "-"
        },
        geometry: {
          type: "Point",
          coordinates: [
            Number(d.longitude),
            Number(d.latitude)
          ]
        }
      }));

    res.status(200).json({
      type: "FeatureCollection",
      features: features
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
