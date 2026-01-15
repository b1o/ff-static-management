// Test with debug output - add logging to parser
import pako from 'pako';

const STGY_PREFIX = "[stgy:a";
const STGY_SUFFIX = "]";
const BYTE_ALIGNMENT_4 = 4;
const BYTE_ALIGNMENT_2 = 2;
const COORDINATE_SCALE = 10;

const FieldIds = {
  BOARD_NAME: 1,
  OBJECT_ID: 2,
  TEXT_TERMINATOR: 3,
  FLAGS: 4,
  POSITIONS: 5,
  ROTATIONS: 6,
  SIZES: 7,
  COLORS: 8,
  PARAM_1: 10,
  PARAM_2: 11,
  PARAM_3: 12,
} as const;

const FlagBits = {
  VISIBLE: 0x01,
  FLIP_HORIZONTAL: 0x02,
  FLIP_VERTICAL: 0x04,
  LOCKED: 0x08,
} as const;

const KEY_TABLE: Record<string, string> = {
  "+": "N", "-": "P", "0": "x", "1": "g", "2": "0", "3": "K", "4": "8", "5": "S",
  "6": "J", "7": "2", "8": "s", "9": "Z", A: "D", B: "F", C: "t", D: "T", E: "6",
  F: "E", G: "a", H: "V", I: "c", J: "p", K: "L", L: "M", M: "m", N: "e", O: "j",
  P: "9", Q: "X", R: "B", S: "4", T: "R", U: "Y", V: "7", W: "_", X: "n", Y: "O",
  Z: "b", a: "i", b: "-", c: "v", d: "H", e: "C", f: "A", g: "r", h: "W", i: "o",
  j: "d", k: "I", l: "q", m: "h", n: "U", o: "l", p: "k", q: "3", r: "f", s: "y",
  t: "5", u: "G", v: "w", w: "1", x: "u", y: "z", z: "Q",
};
const ALPHABET_TABLE: Record<string, string> = {
  b: "-", "2": "0", w: "1", "7": "2", q: "3", S: "4", t: "5", E: "6", V: "7",
  "4": "8", P: "9", f: "A", R: "B", e: "C", A: "D", F: "E", B: "F", u: "G",
  d: "H", k: "I", "6": "J", "3": "K", K: "L", L: "M", "+": "N", Y: "O", "-": "P",
  z: "Q", T: "R", "5": "S", D: "T", n: "U", H: "V", h: "W", Q: "X", U: "Y",
  "9": "Z", W: "_", G: "a", Z: "b", I: "c", j: "d", N: "e", r: "f", "1": "g",
  m: "h", a: "i", O: "j", p: "k", o: "l", M: "m", X: "n", i: "o", J: "p", l: "q",
  g: "r", "8": "s", C: "t", x: "u", c: "v", v: "w", "0": "x", s: "y", y: "z",
};

function base64CharToValue(char: string): number {
  const code = char.charCodeAt(0);
  if (code >= 65 && code <= 90) return code - 65;
  if (code >= 97 && code <= 122) return code - 97 + 26;
  if (code >= 48 && code <= 57) return code - 48 + 52;
  if (char === "-") return 62;
  if (char === "_") return 63;
  throw new Error(`Invalid: ${char}`);
}

function valueToBase64Char(value: number): string {
  if (value < 26) return String.fromCharCode(65 + value);
  if (value < 52) return String.fromCharCode(97 + value - 26);
  if (value < 62) return String.fromCharCode(48 + value - 52);
  if (value === 62) return "-";
  return "_";
}

function decryptCipher(encoded: string, key: number): string {
  let result = "";
  for (let i = 0; i < encoded.length; i++) {
    const standardChar = ALPHABET_TABLE[encoded[i]];
    const val = base64CharToValue(standardChar);
    const decodedVal = (val - i - key) & 0x3f;
    result += valueToBase64Char(decodedVal);
  }
  return result;
}

function decodeBase64(base64: string): Uint8Array {
  const str = base64.replace(/-/g, "+").replace(/_/g, "/");
  const lookup: Record<string, number> = {};
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  for (let i = 0; i < alphabet.length; i++) lookup[alphabet[i]] = i;
  const bytes: number[] = [];
  for (let i = 0; i < str.length; i += 4) {
    const b1 = lookup[str[i]] ?? 0;
    const b2 = lookup[str[i + 1]] ?? 0;
    const b3 = lookup[str[i + 2]] ?? 0;
    const b4 = lookup[str[i + 3]] ?? 0;
    bytes.push((b1 << 2) | (b2 >> 4));
    if (str[i + 2] !== undefined) bytes.push(((b2 & 0xf) << 4) | (b3 >> 2));
    if (str[i + 3] !== undefined) bytes.push(((b3 & 0x3) << 6) | b4);
  }
  return new Uint8Array(bytes);
}

function padTo4Bytes(length: number): number {
  return Math.ceil(length / BYTE_ALIGNMENT_4) * BYTE_ALIGNMENT_4;
}

class BinaryReader {
  private buffer: Uint8Array;
  position: number = 0;

  constructor(data: Uint8Array) {
    this.buffer = data;
  }

  get remaining() {
    return this.buffer.length - this.position;
  }

  readUint8(): number {
    return this.buffer[this.position++];
  }

  readInt16(): number {
    return this.readUint16() << 16 >> 16;
  }

  readUint16(): number {
    return this.readUint8() | (this.readUint8() << 8);
  }

  readUint32(): number {
    return this.readUint8() | (this.readUint8() << 8) | (this.readUint8() << 16) | (this.readUint8() << 24);
  }

  readString(length: number): string {
    const bytes = this.buffer.slice(this.position, this.position + length);
    this.position += length;
    return new TextDecoder().decode(bytes).replace(/\0.*$/, '');
  }

  skip(bytes: number) {
    this.position += bytes;
  }
}

const testString = `[stgy:aM3JoeeOIcLSmn39wH1PPZ3VFehfSpayukrV0xjcByEy998qtZv4I3GLl1Cz1iaGiolcFJuP8P-rta72747544b33Nh-FwwKlK2m3mxAz5i94H7H8aeE16G5vYEmHRE0onbxz6Nq8VQ7n612WC44UnU4YHNhyQACFG6oSDtKvtYJfN+nA+IFSSujDPs+mb5cVoAq8TAXc1YcpDyp44i-d+plf03ewaA4gG7Df-X8VbuIXzvXhXjcSb11MPu8SXp07ouip0JEml4dscQ9qCw72Sdh4YFXG31E5hfhz05TjCuTJaQAXBEmxp1w4irroPVEvO]`;

const data = testString.slice(STGY_PREFIX.length, -1);
const key = base64CharToValue(KEY_TABLE[data[0]]);
const decrypted = decryptCipher(data.slice(1), key);
const binary = decodeBase64(decrypted);
const decompressed = pako.inflate(binary.slice(6));

const reader = new BinaryReader(decompressed);

// Read header
const version = reader.readUint32();
const contentLength = reader.readUint32();
reader.skip(8); // padding

console.log('Version:', version);
console.log('Content length:', contentLength);
console.log('Position after header:', reader.position);

// Parse fields with debug
let insideContentSection = false;
let iterations = 0;
const objectIds: number[] = [];
let boardName = "";
const positions: {x: number, y: number}[] = [];

while (reader.remaining >= 2 && iterations < 100) {
  const posBeforeId = reader.position;
  const id = reader.readUint16();
  console.log(`\n[${posBeforeId}] Field ID: ${id}`);
  iterations++;

  if (id === 0 && !insideContentSection) {
    const sectionLen = reader.readUint16();
    console.log(`  -> Section marker, length=${sectionLen}, pos now=${reader.position}`);
    insideContentSection = true;
    continue;
  }

  if (id === 0) {
    console.log(`  -> Empty field, pos now=${reader.position}`);
    continue;
  }

  if (id === FieldIds.BOARD_NAME) {
    const strLength = reader.readUint16();
    const paddedLength = padTo4Bytes(strLength);
    console.log(`  -> BOARD_NAME: strLength=${strLength}, paddedLength=${paddedLength}`);
    boardName = reader.readString(paddedLength);
    console.log(`  -> boardName="${boardName}", pos now=${reader.position}`);
  } else if (id === FieldIds.OBJECT_ID) {
    const objectId = reader.readUint16();
    objectIds.push(objectId);
    if (objectIds.length <= 3) {
      console.log(`  -> OBJECT_ID: ${objectId}, pos now=${reader.position}`);
    }
  } else if (id === FieldIds.FLAGS) {
    reader.readUint16(); // unused
    const count = reader.readUint16();
    console.log(`  -> FLAGS: count=${count}`);
    for (let i = 0; i < count; i++) reader.readUint8();
    if (count % BYTE_ALIGNMENT_2 === 1) reader.skip(1);
    console.log(`  -> pos now=${reader.position}`);
  } else if (id === FieldIds.POSITIONS) {
    reader.readUint16(); // unused
    const count = reader.readUint16();
    console.log(`  -> POSITIONS: count=${count}`);
    for (let i = 0; i < count; i++) {
      const x = reader.readUint16() / COORDINATE_SCALE;
      const y = reader.readUint16() / COORDINATE_SCALE;
      positions.push({x, y});
    }
    console.log(`  -> pos now=${reader.position}`);
  } else if (id === FieldIds.ROTATIONS) {
    reader.readUint16();
    const count = reader.readUint16();
    console.log(`  -> ROTATIONS: count=${count}`);
    for (let i = 0; i < count; i++) reader.readInt16();
    console.log(`  -> pos now=${reader.position}`);
  } else if (id === FieldIds.SIZES) {
    reader.readUint16();
    const count = reader.readUint16();
    console.log(`  -> SIZES: count=${count}`);
    for (let i = 0; i < count; i++) reader.readUint8();
    if (count % BYTE_ALIGNMENT_2 === 1) reader.skip(1);
    console.log(`  -> pos now=${reader.position}`);
  } else if (id === FieldIds.COLORS) {
    reader.readUint16();
    const count = reader.readUint16();
    console.log(`  -> COLORS: count=${count}`);
    for (let i = 0; i < count; i++) {
      reader.readUint8(); reader.readUint8(); reader.readUint8(); reader.readUint8();
    }
    console.log(`  -> pos now=${reader.position}`);
  } else if (id === FieldIds.PARAM_1 || id === FieldIds.PARAM_2 || id === FieldIds.PARAM_3) {
    reader.readUint16();
    const count = reader.readUint16();
    console.log(`  -> PARAM_${id - 9}: count=${count}`);
    for (let i = 0; i < count; i++) reader.readUint16();
    console.log(`  -> pos now=${reader.position}`);
  } else {
    console.log(`  -> UNKNOWN field, breaking`);
    break;
  }
}

console.log('\n=== SUMMARY ===');
console.log('Board name:', boardName);
console.log('Object IDs count:', objectIds.length);
console.log('First 5 object IDs:', objectIds.slice(0, 5));
console.log('Positions count:', positions.length);
console.log('First 3 positions:', positions.slice(0, 3));
