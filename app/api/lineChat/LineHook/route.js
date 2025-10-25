import { NextResponse } from "next/server";

const userProfiles = new Map(); // เก็บโปรไฟล์ผู้ใช้
let messages = []; // เก็บข้อความทั้งหมดในแชท

// ✅ ดึงข้อมูลโปรไฟล์จาก LINE API
async function getUserProfile(userId) {
  const res = await fetch(`https://api.line.me/v2/bot/profile/${userId}`, {
    headers: {
      Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
    },
  });

  if (!res.ok) return null;
  return await res.json();
}

// ✅ รับ webhook จาก LINE
export async function POST(req) {
  const body = await req.json();

  for (const event of body.events) {
    if (event.type === "message" && event.message.type === "text") {
      const userId = event.source.userId;

      // ถ้าไม่มีข้อมูลในแคช ให้ดึงจาก LINE
      if (!userProfiles.has(userId)) {
        const profile = await getUserProfile(userId);
        if (profile) userProfiles.set(userId, profile);
      }

      const userProfile = userProfiles.get(userId) || {
        displayName: "Unknown",
        pictureUrl: "",
      };

      // เก็บข้อความไว้ใน memory
      messages.push({
        userId,
        text: event.message.text,
        displayName: userProfile.displayName,
        pictureUrl: userProfile.pictureUrl,
        timestamp: new Date(),
      });
    }
  }

  return NextResponse.json({ status: "ok" });
}

// ✅ สำหรับดึงข้อความ (ฝั่งเว็บจะ fetch ตรงนี้)
export async function GET() {
  return NextResponse.json(messages);
}