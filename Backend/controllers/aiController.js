const { GoogleGenAI } = require('@google/generative-ai') || {};

exports.pricePrediction = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
        if (req.user.role !== 'farmer') return res.status(403).json({ error: "Access denied" });

        const { produceName, category, grade, currentPrice, createdAt, harvestedDate } = req.body;
        if (!produceName) return res.status(400).json({ error: 'produceName is required' });

        if (typeof GoogleGenAI !== 'function') {
            return res.status(500).json({ error: 'AI client not configured' });
        }

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const prompt = `As an agricultural AI expert for EcoCycle, analyze this produce listing:
            Name: ${produceName}
            Category: ${category}
            Grade: ${grade}
            Current Price: ${currentPrice}
            Harvested Date: ${harvestedDate}
            Listed Date: ${createdAt || 'New Listing'}
            Today's Date: ${new Date().toISOString()}
            
            Provide insights on the produce's freshness, market value, and potential expiration based on the harvested date and current market trends.
            Return JSON format: {
                "isPastPrime": boolean,
                "suggestedPrice": number,
                "reason": string
                "nearingExpiration": boolean
            }`;
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });

    res.json(JSON.parse(response.text || '{}'));
    } catch (err) {
    res.status(500).json({ error: "AI Prediction failed", details: err.message });
    }
};