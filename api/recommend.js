import fs from "fs"
import path from "path"
import { recommend } from "../server/algorithm/recommender.js"

export default function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {

    const dataPath = path.join(process.cwd(), "server/data/restaurants.json")
    const rawData = fs.readFileSync(dataPath, "utf-8")
    const restaurants = JSON.parse(rawData)

    if (restaurants.length === 0) {
      return res.status(503).json({
        error: "Restaurant dataset is not available",
        code: "DATASET_UNAVAILABLE"
      })
    }

    const preferences = req.body

    if (!preferences.area) {
      return res.status(400).json({
        error: "Area is required",
        code: "MISSING_AREA"
      })
    }

    const startTime = Date.now()

    const results = recommend(preferences, restaurants)

    const elapsed = Date.now() - startTime

    return res.status(200).json({
      results,
      meta: {
        responseTime: elapsed
      }
    })

  } catch (err) {

    return res.status(500).json({
      error: "Recommendation failed",
      message: err.message
    })

  }

}