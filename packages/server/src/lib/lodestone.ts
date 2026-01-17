import { db } from "../db";
import { cacheCharacters, type CachedCharacter } from "../db/schema";
import { eq, and, gt, like, lt } from "drizzle-orm";

const log = (...args: any[]) => {
	console.log("[Lodestone]", ...args);
};

export type Region = "eu" | "na" | "jp" | "oc";

export interface LodestoneConfig {
	region: Region;
	/** Cache TTL in milliseconds. Default: 24 hours */
	cacheTtl?: number;
}

export interface LodestoneSearchParams {
	characterName: string;
	world?: string;
}

export interface CharacterSearchResult {
	lodestoneId: string;
	name: string;
	world: string;
	dc: string;
	avatar: string | null;
}

export interface CharacterProfile extends CharacterSearchResult {
	title?: string;
	race?: string;
	clan?: string;
	gender?: string;
	nameday?: string;
	guardian?: string;
	cityState?: string;
	portrait?: string;
	grandCompany?: string;
	freeCompany?: string;
}

const REGION_URLS: Record<Region, string> = {
	eu: "https://eu.finalfantasyxiv.com",
	na: "https://na.finalfantasyxiv.com",
	jp: "https://jp.finalfantasyxiv.com",
	oc: "https://oc.finalfantasyxiv.com",
};

const DEFAULT_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export class Lodestone {
	private baseUrl: string;
	private cacheTtl: number;

	constructor(config: LodestoneConfig) {
		this.baseUrl = REGION_URLS[config.region];
		this.cacheTtl = config.cacheTtl ?? DEFAULT_CACHE_TTL;
	}

	/**
	 * Search for characters by name, optionally filtered by world.
	 * Results are cached for subsequent requests.
	 */
	async searchCharacters(params: LodestoneSearchParams): Promise<CharacterSearchResult[]> {
		const { characterName, world } = params;

		// Check cache first
		const cached = await this.getCachedSearchResults(characterName, world);
		if (cached.length > 0) {
			console.log(
				`[Lodestone] Cache HIT: search "${characterName}"${world ? ` on ${world}` : ""} (${cached.length} results)`,
			);
			return cached;
		}
		console.log(`[Lodestone] Cache MISS: search "${characterName}"${world ? ` on ${world}` : ""}`);

		// Fetch from Lodestone
		const results = await this.fetchSearchResults(characterName, world);

		// Cache results
		await this.cacheResults(results);

		return results;
	}

	/**
	 * Get a character profile by Lodestone ID.
	 * Returns cached data if available and not expired.
	 */
	async getCharacter(lodestoneId: string): Promise<CharacterProfile | null> {
		// Check cache for full profile data
		const cached = await this.getCachedCharacter(lodestoneId);
		if (cached?.data) {
			console.log(`[Lodestone] Cache HIT: character ${lodestoneId} (${(cached.data as CharacterProfile).name})`);
			return cached.data as CharacterProfile;
		}
		console.log(`[Lodestone] Cache MISS: character ${lodestoneId}${cached ? " (basic info only)" : ""}`);

		// Fetch from Lodestone (even if we have basic cached info, we need full profile)
		const profile = await this.fetchCharacterProfile(lodestoneId);
		if (!profile) return null;

		// Update cache with full profile
		await this.cacheResults([profile]);

		return profile;
	}

	/**
	 * Clear expired cache entries. Call this periodically.
	 */
	async cleanupCache(): Promise<number> {
		const now = new Date();
		const result = await db
			.delete(cacheCharacters)
			.where(lt(cacheCharacters.expiresAt, now))
			.returning({ id: cacheCharacters.lodestoneId });

		return result.length;
	}

	/**
	 * Force refresh a character's cached data.
	 */
	async refreshCharacter(lodestoneId: string): Promise<CharacterProfile | null> {
		await db.delete(cacheCharacters).where(eq(cacheCharacters.lodestoneId, lodestoneId));
		return this.getCharacter(lodestoneId);
	}

	// === Private methods ===

	private async getCachedSearchResults(name: string, world?: string): Promise<CharacterSearchResult[]> {
		const now = new Date();
		const conditions = [like(cacheCharacters.name, `%${name}%`), gt(cacheCharacters.expiresAt, now)];

		if (world) {
			conditions.push(eq(cacheCharacters.world, world));
		}

		const results = await db
			.select()
			.from(cacheCharacters)
			.where(and(...conditions));

		return results.map((r) => ({
			lodestoneId: r.lodestoneId,
			name: r.name,
			world: r.world,
			dc: r.dc,
			avatar: r.avatar,
		}));
	}

	private async getCachedCharacter(lodestoneId: string): Promise<CachedCharacter | null> {
		const now = new Date();
		const [cached] = await db
			.select()
			.from(cacheCharacters)
			.where(and(eq(cacheCharacters.lodestoneId, lodestoneId), gt(cacheCharacters.expiresAt, now)));

		return cached ?? null;
	}

	private isFullProfile(result: CharacterSearchResult | CharacterProfile): result is CharacterProfile {
		return "race" in result || "portrait" in result || "nameday" in result;
	}

	private async cacheResults(results: (CharacterSearchResult | CharacterProfile)[]): Promise<void> {
		if (results.length === 0) return;

		const expiresAt = new Date(Date.now() + this.cacheTtl);

		for (const result of results) {
			const isProfile = this.isFullProfile(result);

			await db
				.insert(cacheCharacters)
				.values({
					lodestoneId: result.lodestoneId,
					name: result.name,
					world: result.world,
					dc: result.dc,
					avatar: result.avatar,
					data: isProfile ? result : null,
					expiresAt,
				})
				.onConflictDoUpdate({
					target: cacheCharacters.lodestoneId,
					set: {
						name: result.name,
						world: result.world,
						dc: result.dc,
						avatar: result.avatar,
						// Only update data if this is a full profile, otherwise preserve existing data
						...(isProfile ? { data: result } : {}),
						fetchedAt: new Date(),
						expiresAt,
					},
				});
		}
	}

	private async fetchSearchResults(name: string, world?: string): Promise<CharacterSearchResult[]> {
		const start = process.hrtime();
		const params = new URLSearchParams({ q: name });
		if (world) {
			params.set("worldname", world);
		}

		const url = `${this.baseUrl}/lodestone/character/?${params}`;
		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`Lodestone search failed: ${response.status}`);
		}

		const html = await response.text();
		const elapsed = process.hrtime(start);
		log(
			`Fetched search results for "${name}"${world ? ` on ${world}` : ""} in ${elapsed[0]}s ${Math.round(elapsed[1] / 1e6)}ms`,
		);
		return this.parseSearchResults(html);
	}

	private async fetchCharacterProfile(lodestoneId: string): Promise<CharacterProfile | null> {
		const url = `${this.baseUrl}/lodestone/character/${lodestoneId}/`;
		const response = await fetch(url);

		if (response.status === 404) {
			return null;
		}

		if (!response.ok) {
			throw new Error(`Lodestone profile fetch failed: ${response.status}`);
		}

		const html = await response.text();
		return this.parseCharacterProfile(html, lodestoneId);
	}

	private parseSearchResults(html: string): CharacterSearchResult[] {
		const start = process.hrtime();
		const results: CharacterSearchResult[] = [];

		// Match character entries: <div class="entry"><a href="/lodestone/character/ID/" class="entry__link">...</a></div>
		const entryRegex =
			/<div class="entry"><a href="\/lodestone\/character\/(\d+)\/" class="entry__link">([\s\S]*?)<\/a><\/div>/g;
		const entries = html.matchAll(entryRegex);

		for (const entry of entries) {
			const lodestoneId = entry[1];
			const entryHtml = entry[2];

			if (!lodestoneId || !entryHtml) continue;

			// Extract name: <p class="entry__name">Character Name</p>
			const nameMatch = entryHtml.match(/<p class="entry__name">([^<]+)<\/p>/);
			const name = nameMatch?.[1]?.trim() ?? "";

			// Extract world/DC: <p class="entry__world"><i ...></i>World [DC]</p>
			// Skip any tags, then capture world name and DC
			const worldMatch = entryHtml.match(/<p class="entry__world">(?:<[^>]+>)*([A-Za-z]+)\s*\[([^\]]+)\]/);
			const world = worldMatch?.[1]?.trim() ?? "";
			const dc = worldMatch?.[2]?.trim() ?? "";

			// Extract avatar from entry__chara__face div
			const avatarMatch = entryHtml.match(/<div class="entry__chara__face"><img src="([^"]+)"/);
			const avatar = avatarMatch?.[1] ?? null;

			if (lodestoneId && name) {
				results.push({ lodestoneId, name, world, dc, avatar });
			}
		}
		const elapsed = process.hrtime(start);
		log(`Parsed ${results.length} search results in ${elapsed[0]}s ${Math.round(elapsed[1] / 1e6)}ms`);

		return results;
	}

	private parseCharacterProfile(html: string, lodestoneId: string): CharacterProfile | null {
		// Extract name: <p class="frame__chara__name">Name</p>
		const nameMatch = html.match(/<p class="frame__chara__name">([^<]+)<\/p>/);
		const name = nameMatch?.[1]?.trim() ?? "";

		if (!name) return null;

		// World/DC: <p class="frame__chara__world"><i ...></i>World [DC]</p>
		// Skip any tags, then capture world name and DC
		const worldMatch = html.match(/<p class="frame__chara__world">(?:<[^>]+>)*([A-Za-z]+)\s*\[([^\]]+)\]/);
		const world = worldMatch?.[1]?.trim() ?? "";
		const dc = worldMatch?.[2]?.trim() ?? "";

		// Title: <p class="frame__chara__title">Title</p>
		const titleMatch = html.match(/<p class="frame__chara__title">([^<]+)<\/p>/);
		const title = titleMatch?.[1]?.trim();

		// Avatar from frame__chara__face
		const avatarMatch = html.match(/<div class="frame__chara__face"[^>]*>[\s\S]*?<img src="([^"]+)"/);
		const avatar = avatarMatch?.[1] ?? null;

		// Portrait (full body image) - usually in character__detail__image
		const portraitMatch = html.match(/<div class="character__detail__image"[^>]*>[\s\S]*?<img src="([^"]+)"/);
		const portrait = portraitMatch?.[1];

		// Race/Clan/Gender: <p class="character-block__name">Race<br />Clan / Gender</p>
		const raceBlockMatch = html.match(
			/<p class="character-block__title">Race\/Clan\/Gender<\/p>\s*<p class="character-block__name">([^<]+)<br\s*\/?>\s*([^/]+)\s*\/\s*([^<]+)<\/p>/,
		);
		const race = raceBlockMatch?.[1]?.trim();
		const clan = raceBlockMatch?.[2]?.trim();
		const gender = raceBlockMatch?.[3]?.trim();

		// Nameday
		const namedayMatch = html.match(
			/<p class="character-block__title">Nameday<\/p>\s*<p class="character-block__birth">([^<]+)<\/p>/,
		);
		const nameday = namedayMatch?.[1]?.trim();

		// Guardian
		const guardianMatch = html.match(
			/<p class="character-block__title">Guardian<\/p>\s*<p class="character-block__name">([^<]+)<\/p>/,
		);
		const guardian = guardianMatch?.[1]?.trim();

		// City-state
		const cityMatch = html.match(
			/<p class="character-block__title">City-state<\/p>\s*<p class="character-block__name">([^<]+)<\/p>/,
		);
		const cityState = cityMatch?.[1]?.trim();

		// Grand Company
		const gcMatch = html.match(
			/<p class="character-block__title">Grand Company<\/p>\s*<p class="character-block__name">([^<]+)<\/p>/,
		);
		const grandCompany = gcMatch?.[1]?.trim();

		// Free Company: <a href="/lodestone/freecompany/..." class="character__freecompany__name">FC Name</a>
		const fcMatch = html.match(
			/<a href="\/lodestone\/freecompany\/[^"]+" class="character__freecompany__name[^"]*">([^<]+)<\/a>/,
		);
		const freeCompany = fcMatch?.[1]?.trim();

		return {
			lodestoneId,
			name,
			world,
			dc,
			avatar,
			title,
			race,
			clan,
			gender,
			nameday,
			guardian,
			cityState,
			portrait,
			grandCompany,
			freeCompany,
		};
	}
}

// Singleton instance for convenience
let defaultInstance: Lodestone | null = null;

export function getLodestone(config?: LodestoneConfig): Lodestone {
	if (!defaultInstance) {
		defaultInstance = new Lodestone(config ?? { region: "eu" });
	}
	return defaultInstance;
}
