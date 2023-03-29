import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, EmbedBuilder, InteractionCollector, MappedInteractionTypes } from "discord.js";
import config from "../config.json";
import { FindMangaByTitle } from "./MangaAPI";

/**
 * @remarks
 * This function generates a Discord Embed for a given Manga object.
 * 
 * @param manga The JSON object returned from FindMangaByTitle().
 * @param timeTaken The passed through time taken to run entire function.
 * @returns Formatted EmbedBuilder object for a message embed.
 */
export const GetMangaEmbed = async (manga: any): Promise<EmbedBuilder> => {
    manga == "err" ? manga = {} : manga = manga;
    if(manga.length == 0) { return new EmbedBuilder().setTitle("Broken Result :("); }

    const descStrip = manga.comic.desc?.replace(/<[^>]*>?/gm, '').substring(0, 200) || "No description found.";
    
    const embed = new EmbedBuilder()
        .setColor(7419530)
        .setTitle(manga.comic.title)
        .setURL(`${config.WEBSITE_URL}comic/${manga.comic.slug}`)
        .setDescription(descStrip)
        .setImage(manga.comic.cover_url)
        .setTimestamp()

    if(manga.authors.length > 0){
        embed.setAuthor({ name: `Author: ${manga.authors[0].name}` })
    } else {
        embed.setAuthor({ name: `Author: Unknown` });
    }

    return embed;
}

/**
 * @remarks
 * This function generates a Discord ActionRow for a given Embed object. A new one is generated for every page of an embed.
 * 
 * @param id ID of the User who is interacting with the embed.
 * @param pages A key value pair of pages used to toggle a button status.
 * @param embedCount The total number of embeds that are paginated.
 * @returns ActionRowBuilder object for a message component.
 */
export const GetEmbedRow = (id: string, pages: {[key: string]: number}, embedCount: number): ActionRowBuilder<ButtonBuilder> => {
    const row = new ActionRowBuilder<ButtonBuilder>();
    
    row.addComponents(
        new ButtonBuilder()
            .setCustomId('previous_embed')
            .setLabel('<')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(pages[id] === 0)
    )

    row.addComponents(
        new ButtonBuilder()
            .setCustomId('track_manga_embed')
            .setLabel('Track')
            .setStyle(ButtonStyle.Success)
            .setDisabled(false)
    )

    console.log(pages[id]);

    row.addComponents(
        new ButtonBuilder()
            .setCustomId('next_embed')
            .setLabel('>')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(pages[id] === embedCount - 1)
    )

    return row;
}

export const GetEmbedPagination = async (mangaArr: any[], interaction: ChatInputCommandInteraction) => {
    // Create the embeds
    let mangaEmbeds: EmbedBuilder[] = [];
    const pages = {} as {[key: string]: number};

    for(let i = 0; i < mangaArr.length; i++){
        const mangaContent = await FindMangaByTitle(config.API_URL + `comic/${mangaArr[i].slug}?tachiyomi=true`) || "err";
        mangaEmbeds.push(await GetMangaEmbed(mangaContent));
    }

    const time = 1000 * 60 * 5;
    const id = interaction.user.id;
    pages[id] = pages[id] || 0;

    const embed = mangaEmbeds[pages[id]];

    return {
        "collector": (await interaction.followUp({ embeds: [embed], components: [GetEmbedRow(id, pages, mangaEmbeds.length)] })).createMessageComponentCollector({time}),
        "embeds": mangaEmbeds,
        "pages": pages
    }
}