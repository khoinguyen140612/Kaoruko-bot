import fs from "fs";

const DATA_PATH = "./data/affection.json";

function loadData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_PATH));
  } catch {
    return {};
  }
}

function saveData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

// 🩷 Lấy mức độ thân thiết
export function getAffection(userId) {
  const data = loadData();
  return data[userId]?.level || 0;
}

// 💗 Tăng mức độ khi nói chuyện
export function increaseAffection(userId, amount = 1) {
  const data = loadData();
  if (!data[userId]) data[userId] = { level: 0, messages: 0 };
  data[userId].messages += 1;

  // Cứ 5 tin nhắn thì tăng 1 cấp (tối đa 10)
  if (data[userId].messages % 5 === 0 && data[userId].level < 10) {
    data[userId].level += amount;
  }

  saveData(data);
}

// 🔧 DEV: chỉnh tay affection
export function setAffection(userId, level) {
  const data = loadData();
  data[userId] = { level: Math.min(level, 10), messages: 0 };
  saveData(data);
}

// 💣 RESET: xóa dữ liệu 1 người hoặc tất cả
export function resetAffection(userId = null) {
  const data = loadData();

  if (userId) {
    delete data[userId]; // xóa người chỉ định
  } else {
    for (const id in data) delete data[id]; // xóa tất cả
  }

  saveData(data);
}

// 🧠 Tạo tone phù hợp theo mức độ
export function getTone(level) {
  if (level <= 2) return "lịch sự, hơi xa cách";
  if (level <= 5) return "ấm áp, thân thiện hơn một chút";
  if (level <= 8) return "rất gần gũi, nói chuyện tự nhiên, thân mật";
  return "rất đáng yêu và thân thiết, như người bạn cực kỳ gần gũi 💞";
}
