export default async function handler(req, res) {
  try {
    // ambil parameter dari URL
    const hours = parseInt(req.query.hours || "24");

    const url = "https://opsroom.sipongidata.my.id/api/opsroom/indoHotspot?wilayah=IN&filterperiode=false&satelit[]=NASA-MODIS&satelit[]=NASA-SNPP&satelit[]=NASA-NOAA20&confidence[]=low&confidence[]=medium&confidence[]=high";

    const response = await fetch(url);
    const json = await response.json();

    const raw = json.data || [];

    const now = new Date();

    const features = raw
      .filter(d => d.latitude && d.longitude)
      .filter(d => {
        // filter waktu (kalau ada field waktu)
        if (!d.tanggal) return true;

        const t = new Date(d.tanggal);
        const diffHours = (now - t) / (1000 * 60 * 60);

        return diffHours <= hours;
      })
      .map((d) => ({
        type: "Feature",
        properties: {
          confidence: d.confidence,
          brightness: d.brightness,
          tanggal: d.tanggal
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
      features
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
