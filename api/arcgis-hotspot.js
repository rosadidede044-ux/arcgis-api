export default async function handler(req, res) {
  try {
    // CORS wajib untuk arcgis
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    
    const hours = parseInt(req.query.hours || "9999"); // default semua

    const url = "https://opsroom.sipongidata.my.id/api/opsroom/indoHotspot?wilayah=IN&filterperiode=false&satelit[]=NASA-MODIS&satelit[]=NASA-SNPP&satelit[]=NASA-NOAA20&confidence[]=low&confidence[]=medium&confidence[]=high";

    const response = await fetch(url);
    const json = await response.json();

    const raw = json.features || [];

    const now = new Date();

    const features = raw
      .filter(f => f.geometry && f.geometry.coordinates)
      .filter(f => {
        const waktu = f.properties.date_hotspot_ori;
        if (!waktu) return true;

        const t = new Date(waktu);
        const diffHours = (now - t) / (1000 * 60 * 60);

        return diffHours <= hours;
      })
      .map((f) => ({
        type: "Feature",
        properties: {
          confidence: f.properties.confidence_level,
          brightness: f.properties.confidence,
          provinsi: f.properties.nama_provinsi,
          kabupaten: f.properties.kabkota,
          kecamatan: f.properties.kecamatan,
          desa: f.properties.desa,
          waktu: f.properties.date_hotspot_ori
        },
        geometry: {
          type: "Point",
          coordinates: f.geometry.coordinates
        }
      }));

    res.status(200).json({
      type: "FeatureCollection",
      features
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
