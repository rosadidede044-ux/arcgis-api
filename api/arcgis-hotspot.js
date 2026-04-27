export default async function handler(req, res) {
  try {
    const url = "https://opsroom.sipongidata.my.id/api/opsroom/indoHotspot?wilayah=IN&filterperiode=false&satelit[]=NASA-MODIS&satelit[]=NASA-SNPP&satelit[]=NASA-NOAA20&confidence[]=low&confidence[]=medium&confidence[]=high";

    const response = await fetch(url);
    const json = await response.json();

    const raw = json.data || [];

    const features = raw
      .filter(d => d.latitude && d.longitude)
      .map((d) => ({
        type: "Feature",
        properties: {
          confidence: d.confidence,
          brightness: d.brightness,
          waktu: d.tanggal || d.acq_date || d.datetime || "unknown"
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
