const express = require('express');
const cors = require('cors');
const path = require('path');
const { HfInference } = require("@huggingface/inference");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// ==========================================
// HARDCODED TOKENS
// ==========================================
const HF_TOKEN = "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"; 
const hf = new HfInference(HF_TOKEN);
console.log("✅✅✅ HUGGING FACE TOKEN LOADED SUCCESSFULLY! ✅✅✅");

// High-Quality Fallback Data Generator
function generateFallbackData(prompt, totalScenes, platform, tone, language) {
    const scenes = [];
    const isShort = platform === 'instagram' || platform === 'tiktok' || platform === 'shorts';
    
    const fallbackStrings = {
        English: {
            desc: `Yo, you literally need to stop scrolling and watch this right now. 🛑👇\n\nWe are diving deep into the crazy world of ${prompt}, and trust me, what we found is absolutely insane. 🤯\n\nHere is exactly what you're going to learn today:\n• The hidden truth nobody talks about 🤫\n• The biggest plot twist you won't see coming 🔄\n• How this actually impacts you right now 💡\n\nIf you find this valuable, smash that like button! 🔥✨`,
            voice: `We uncover the truth about ${prompt}. The tension rises as the mystery deepens.`,
            title: `The Untold Story of ${prompt} 🔥`,
            img: `Cinematic shot of ${prompt}, 8k resolution, ${tone} tone, dramatic lighting.`,
            vid: `Slow pan across ${prompt}, highly detailed, smooth motion.`
        },
        Hindi: {
            desc: `यार, आपको अभी रुककर यह वीडियो देखना चाहिए। 🛑👇\n\nहम ${prompt} की अजीबोगरीब दुनिया में गहराई से जा रहे हैं, और मेरा विश्वास करें, हमने जो पाया है वह पूरी तरह से पागलपन है। 🤯\n\nयहाँ बताया गया है कि आप आज क्या सीखने जा रहे हैं:\n• वह छिपी हुई सच्चाई जिसके बारे में कोई बात नहीं करता 🤫\n• सबसे बड़ा प्लॉट ट्विस्ट जो आपको नहीं दिखेगा 🔄\n• यह वास्तव में अभी आपको कैसे प्रभावित करता है 💡\n\nअगर आपको यह मूल्यवान लगे, तो लाइक बटन दबाएं! 🔥✨`,
            voice: `हम ${prompt} के बारे में सच्चाई का पता लगाते हैं। तनाव बढ़ता है।`,
            title: `${prompt} की अनसुनी कहानी 🔥`,
            img: `${prompt} की सिनेमाई शॉट, 8k रेजोल्यूशन, ${tone} टोन, नाटकीय प्रकाश।`,
            vid: `${prompt} के पार धीमी गति से पैन करें।`
        },
        Bengali: {
            desc: `আপনাকে এখনই থামতে হবে এবং এই ভিডিওটি দেখতে হবে। 🛑👇\n\nআমরা ${prompt}-এর অদ্ভুত জগতে গভীরে যাচ্ছি, এবং বিশ্বাস করুন, আমরা যা পেয়েছি তা সম্পূর্ণ পাগলামি। 🤯\n\nআজ আপনি ঠিক কী শিখতে যাচ্ছেন তা এখানে দেওয়া হলো:\n• লুকানো সত্য যা নিয়ে কেউ কথা বলে না 🤫\n• সবচেয়ে বড় প্লট টুইস্ট যা আপনি দেখতে পাবেন না 🔄\n• এটি এখন আপনাকে কীভাবে প্রভাবিত করে 💡\n\nযদি এটি মূল্যবান মনে হয়, লাইক বাটনে ক্লিক করুন! 🔥✨`,
            voice: `আমরা ${prompt} সম্পর্কে সত্য উন্মোচন করি। উত্তেজনা বাড়ছে।`,
            title: `${prompt}-এর অজানা গল্প 🔥`,
            img: `${prompt}-এর সিনেম্যাটিক শট, 8k রেজোলিউশন, ${tone} টোন, নাটকীয় আলো।`,
            vid: `${prompt}-এর উপর ধীরে ধীরে প্যান করুন।`
        }
    };

    const langData = fallbackStrings[language] || fallbackStrings.English;

    for (let i = 1; i <= totalScenes; i++) {
        scenes.push({
            scene: i,
            title: `Scene ${i}: ${langData.title}`,
            voiceover: langData.voice,
            imagePrompt: langData.img,
            videoPrompt: langData.vid,
            tools: "Midjourney | Runway | ElevenLabs"
        });
    }
    
    const baseTags = ["#viral", "#trending", "#youtube", "#contentcreator", "#youtuber", "#viralvideo", "#mustwatch", "#mindblown", "#facts", "#storytime", "#aesthetic", "#genz", "#editing", "#video", "#subscribe", "#like", "#comment", "#share", "#daily", "#new", "#love", "#instadaily", "#creator", "#cinematic", "#documentary", "#8k", "#aivideo", "#film"];
    const customTag = `#${prompt.replace(/\s+/g, '').toLowerCase()}`;
    const fallbackTags = [customTag, ...baseTags].slice(0, 30);

    return {
        videoTitle: langData.title,
        alternativeTitles: [`Why ${prompt} Is Changing Everything 🤯`, `The Dark Truth About ${prompt} 😱`, `You Won't Believe What Happened With ${prompt} 🔥`],
        videoDescription: isShort ? "POV: You need to see this. 😱" : langData.desc,
        thumbnailPrompt: isShort ? `Vertical portrait, aesthetic ${prompt}.` : `YouTube thumbnail of ${prompt}.`,
        thumbnailTexts: ["WAIT FOR IT", "MIND BLOWN", "THE TRUTH"],
        pinnedComment: "What do you think? Let me know below!",
        bestTimeToPost: "Friday at 3 PM",
        tags: fallbackTags,
        musicSuggestion: "Epic Cinematic",
        sfxSuggestion: "Whoosh transitions",
        directorsNote: "Keep cuts fast in the first 10 seconds.",
        scenes: scenes
    };
}

app.post('/api/generate', async (req, res) => {
    try {
        const { prompt, language, totalScenes, platform, tone } = req.body;

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // Simulate a slight delay so the frontend terminal animation looks cool
        setTimeout(() => {
            const fallback = generateFallbackData(prompt, totalScenes, platform, tone, language);
            const finalString = JSON.stringify(fallback);
            
            // Stream the complete text
            res.write(`data: ${JSON.stringify({ done: true, fullText: finalString })}\n\n`);
            res.end();
        }, 1500); // 1.5 second delay to build suspense

    } catch (error) {
        console.error("Server Error:", error);
        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        res.end();
    }
});

app.post('/api/generate-image', async (req, res) => {
    const { prompt, platform } = req.body;
    
    try {
        if (!HF_TOKEN) throw new Error("HF_TOKEN not configured");
        
        const imageBlob = await hf.textToImage({
            model: 'black-forest-labs/FLUX.1-schnell',
            inputs: prompt,
        });
        
        const buffer = await imageBlob.arrayBuffer();
        const base64Image = Buffer.from(buffer).toString('base64');
        res.json({ imageUrl: `data:image/jpeg;base64,${base64Image}` });
        
    } catch (error) {
        console.warn("HF Image failed, falling back to Pollinations...", error.message);
        const isShort = platform === 'instagram' || platform === 'tiktok' || platform === 'shorts';
        const width = isShort ? 720 : 1024;
        const height = isShort ? 1280 : 576;
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&nologo=true&seed=${Math.floor(Math.random() * 100000)}`;
        res.json({ imageUrl: imageUrl });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Website running at: http://localhost:${PORT}/idea.html`);
});