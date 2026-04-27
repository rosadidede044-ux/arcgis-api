export default async function handler(req, res) {
  try {
    // ✅ CORS
    res.setHeader("Access-Control-Allow-Origin", "*");

    const hours = parseInt(req.query.hours || "24");

    const url = "https://opsroom.sipongidata.my.id/api/opsroom/indoHotspot?wilayah=IN&filterperiode=false&satelit[]=NASA-MODIS&satelit[]=NASA-SNPP&satelit[]=NASA-NOAA20&confidence[]=low&confidence[]=medium&confidence[]=high";

    const response = await fetch(url);
    const json = await response.json();

    const raw = json.features || [];
    const now = new Date();

    const features = raw
      .filter(f => f.geometry && f.geometry.coordinates)
      .filter(f => {
        const t = new Date(f.properties.date_hotspot_ori);
        const diff = (now - t) / (1000 * 60 * 60);
        return diff <= hours;
      })
      .map(f => ({
        type: "Feature",
        properties: {
          confidence: f.properties.confidence_level,
          provinsi: f.properties.nama_provinsi,
          kabupaten: f.properties.kabkota,
          waktu: f.properties.date_hotspot_ori
        },
        geometry: {
          type: "Point",
          coordinates: f.geometry.coordinates
        }
      }));

    // ✅ ini penting: pakai json() bukan send()
    res.status(200).json({
      type: "FeatureCollection",
      features
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
