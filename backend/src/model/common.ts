import dotenv from "dotenv";
import path from "path";
import OpenAI from "openai";
import fs from "fs";
import axios from "axios";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// OpenAI 메시지 타입 정의
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

// 메시지 배열을 JSON 문자열로 변환하는 공통 함수
export function toMessageInputs(
  system: string,
  user: string,
  history: { role: "user" | "assistant"; content: string }[] = []
): string {
  const messages: ChatMessage[] = [
    {
      role: "system",
      content: system,
    },
    {
      role: "user",
      content: user,
    },
    ...history.map((h) => ({
      role: h.role === "user" ? ("user" as const) : ("assistant" as const),
      content: h.content,
    })),
  ];

  return JSON.stringify(messages);
}

// GPT API 호출 함수 (JSON 문자열 받는 버전 - 기존 호환성)
export async function callGptApi(
  messagesInput: string,
  options?: {
    maxTokens?: number;
    temperature?: number;
    model?: string;
  }
) {
  console.log("GPT Key:", process.env.OPENAI_API_KEY ? "Exists" : "Missing");
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const messages = JSON.parse(messagesInput);

    const response = await openai.chat.completions.create({
      model: options?.model || "gpt-4o-mini",
      messages: messages,
      max_tokens: options?.maxTokens || 500,
      temperature: options?.temperature || 0.8,

    });

    if (!response.choices || response.choices.length === 0) {
      throw new Error("GPT API에서 응답을 받지 못했습니다.");
    }

    return response.choices[0].message.content || "응답을 생성할 수 없습니다.";
  } catch (error) {
    console.error("GPT API 호출 오류:", error);
    throw new Error(`GPT API Error: ${error}`);
  }
}

// GPT API 호출 함수 (메시지 배열 직접 받는 버전)
export async function callGptApiDirect(
  messages: ChatMessage[],
  options?: {
    maxTokens?: number;
    temperature?: number;
    model?: string;
  }
) {
  console.log("GPT Key:", process.env.OPENAI_API_KEY ? "Exists" : "Missing");
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const response = await openai.chat.completions.create({
      model: options?.model || "gpt-4o-mini",
      messages: messages,
      max_tokens: options?.maxTokens || 500,
      temperature: options?.temperature || 0.8,
    });

    if (!response.choices || response.choices.length === 0) {
      throw new Error("GPT API에서 응답을 받지 못했습니다.");
    }

    return response.choices[0].message.content || "응답을 생성할 수 없습니다.";
  } catch (error) {
    console.error("GPT API 호출 오류:", error);
    throw new Error(`GPT API Error: ${error}`);
  }
}

// 이미지를 base64로 인코딩하는 함수
export function encodeImageToBase64(imagePath: string): string {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    return imageBuffer.toString('base64');
  } catch (error) {
    console.error(`이미지 인코딩 오류: ${error}`);
    throw new Error(`이미지를 base64로 변환할 수 없습니다: ${imagePath}`);
  }
}

// URL에서 이미지를 다운로드하여 로컬에 저장하는 함수
export async function downloadAndSaveImage(imageUrl: string, savePath: string): Promise<string> {
  try {
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer'
    });
    
    // 디렉토리가 없으면 생성
    const dir = path.dirname(savePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // 이미지 저장
    fs.writeFileSync(savePath, response.data);
    
    // 상대 경로 반환 (public 폴더 기준)
    return path.relative('public', savePath);
  } catch (error) {
    console.error(`이미지 다운로드 오류: ${error}`);
    throw new Error(`이미지를 다운로드할 수 없습니다: ${imageUrl}`);
  }
}

// DALL-E API로 이미지 생성하는 함수
export async function generateArtworkImage(
  backgroundImagePath: string,
  characterImagePath: string,
  prompt: string = "이미지로 준 똑같은 배경과 똑같은 캐릭터를 자연스럽게 조합한 아름다운 작품 이미지를 만들어줘. 모르는 사람이 봐도 같은 캐릭터임을 알 수 있을 정도로 캐릭터 외모가 똑같아야 함."
) {
  console.log("DALL-E API 호출 시작");
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    // 이미지들을 base64로 인코딩
    const backgroundBase64 = encodeImageToBase64(backgroundImagePath);
    const characterBase64 = encodeImageToBase64(characterImagePath);

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `${prompt}. 이미지로 준 똑같은 배경과 똑같은 캐릭터를 자연스럽게 조합한 아름다운 작품 이미지를 만들어줘. 모르는 사람이 봐도 같은 캐릭터임을 알 수 있을 정도로 캐릭터 외모가 똑같아야 함.`,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      style: "natural",
    });

    if (!response.data || response.data.length === 0) {
      throw new Error("DALL-E API에서 이미지를 생성하지 못했습니다.");
    }

    return response.data[0].url;
  } catch (error) {
    console.error("DALL-E API 호출 오류:", error);
    throw new Error(`이미지 생성 오류: ${error}`);
  }
}

// Vision API를 사용해서 이미지 분석 후 작품 생성하는 함수
export async function generateArtworkWithVision(
  backgroundImagePath: string,
  characterImagePath: string,
  prompt: string = "이미지로 준 똑같은 배경과 똑같은 캐릭터를 자연스럽게 조합한 아름다운 작품 이미지를 만들어줘. 모르는 사람이 봐도 같은 캐릭터임을 알 수 있을 정도로 캐릭터 외모가 똑같아야 함."
) {
  console.log("Vision API + DALL-E 호출 시작");
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    // 이미지들을 base64로 인코딩
    const backgroundBase64 = encodeImageToBase64(backgroundImagePath);
    const characterBase64 = encodeImageToBase64(characterImagePath);

    // Vision API로 이미지 분석
    const visionResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "당신은 이미지 분석 전문가입니다. 배경 이미지와 캐릭터 이미지를 분석하여 작품 이미지 생성을 위한 상세한 프롬프트를 작성해주세요."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `배경 이미지와 캐릭터 이미지를 분석하여 "${prompt}"에 맞는 작품 이미지 생성을 위한 상세한 프롬프트를 작성해주세요. 스타일, 색감, 구도 등을 구체적으로 설명해주세요.`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${backgroundBase64}`
              }
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${characterBase64}`
              }
            }
          ]
        }
      ],
      max_tokens: 500
    });

    const enhancedPrompt = visionResponse.choices[0].message.content || prompt;

    // DALL-E로 이미지 생성
    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: enhancedPrompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      style: "natural",
    });

    if (!imageResponse.data || imageResponse.data.length === 0) {
      throw new Error("DALL-E API에서 이미지를 생성하지 못했습니다.");
    }

    return {
      imageUrl: imageResponse.data[0].url,
      enhancedPrompt: enhancedPrompt
    };
  } catch (error) {
    console.error("Vision API + DALL-E 호출 오류:", error);
    throw new Error(`이미지 생성 오류: ${error}`);
  }
}

export const PUBLIC_DIR = path.resolve(__dirname, "../../public");

export function resolvePublicPath(p?: string | null) {
  if (!p) return null;
  // 앞의 "public/" 제거 → 'background/x.png'처럼 맞춤
  const rel = p.replace(/^[\\/]*public[\\/]+/i, "");
  // 이중으로 'background/background' 붙는 것 방지
  const normalized = rel.replace(/^[\\/]+/, "");
  return path.join(PUBLIC_DIR, normalized);
}

export function ensureFileExists(p: string) {
  if (!fs.existsSync(p)) {
    throw new Error(`Image not found: ${p}`);
  }
  return p;
}