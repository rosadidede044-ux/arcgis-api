export default async function handler(req, res) {
  try {
    const url = "https://opsroom.sipongidata.my.id/api/opsroom/indoHotspot?wilayah=IN&confidence[]=low&confidence[]=medium&confidence[]=high";

    const response = await fetch(url);
    const json = await response.json();

    const raw = json.data || [];

    const features = raw
      .filter(d => d.latitude && d.longitude)
      .map((d, i) => ({
        attributes: {
          OBJECTID: i + 1,
          confidence: d.confidence || "unknown",
          satellite: d.satelit || "unknown",
          brightness: Number(d.brightness) || 0
        },
        geometry: {
          x: Number(d.longitude),
          y: Number(d.latitude)
        }
      }));

    res.status(200).json({
      objectIdFieldName: "OBJECTID",
      geometryType: "esriGeometryPoint",
      spatialReference: { wkid: 4326 },
      exceededTransferLimit: false,
      fields: [
        { name: "OBJECTID", type: "esriFieldTypeOID" },
        { name: "confidence", type: "esriFieldTypeString" },
        { name: "satellite", type: "esriFieldTypeString" },
        { name: "brightness", type: "esriFieldTypeDouble" }
      ],
      features: features
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
