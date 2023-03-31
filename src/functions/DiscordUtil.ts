import { ActionRow, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, EmbedBuilder, InteractionCollector, MappedInteractionTypes, StringSelectMenuBuilder } from "discord.js";
import config from "../config.json";
import { FindMangaByTitle } from "./MangaAPI";
import { Comic } from "../models/comic";
import { slugify } from "./Util";
//TODO: Improve the accuracy of parameter obejcts -> "any" should be more specific.
/**
 * @remarks
 * This function generates a Discord Embed for a given Manga object.
 * 
 * @param {any} manga The JSON object returned from FindMangaByTitle().
 * @returns {EmbedBuilder} Formatted EmbedBuilder object for a message embed.
 */
export const GetMangaEmbed = async (manga: any): Promise<EmbedBuilder> => {
    manga == "err" ? manga = {} : manga = manga;
    if(manga.length == 0) { return new EmbedBuilder().setTitle("Broken Result :("); }

    const descStrip = manga.comic.desc?.replace(/<[^>]*>?/gm, '').substring(0, 200) || "No description found.";
    
    const embed = new EmbedBuilder()
        .setColor(7419530)
        .setTitle(manga.comic.title)
        .setURL(`${config.WEBSITE_URL}comic/${manga.comic.hid}`)
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
 * @param {string} id ID of the User who is interacting with the embed.
 * @param {{[key: string]: number}} pages A key value pair of pages used to toggle a button status.
 * @param {number} pageCount The total number of pages that are required // SHOULD BE CHANGED IN THE FUTURE PROBABLY REDUNDANT.
 * @returns {ActionRowBuilder<ButtonBuilder>} ActionRowBuilder object for a message component.
 */
export const GetEmbedRow = (id: string, pages: {[key: string]: number}, pageCount: number, rowType: string): ActionRowBuilder<ButtonBuilder> => {
    const row = new ActionRowBuilder<ButtonBuilder>();
    
    row.addComponents(
        new ButtonBuilder()
            .setCustomId('previous_embed')
            .setLabel('<')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(pages[id] === 0)
    )

    if(rowType === "follow"){
        row.addComponents(
            new ButtonBuilder()
                .setCustomId('follow_manga_embed')
                .setLabel('Follow')
                .setStyle(ButtonStyle.Success)
                .setDisabled(false)
        )
    } else if(rowType === "unfollow"){
        row.addComponents(
            new ButtonBuilder()
                .setCustomId('unfollow_manga')
                .setLabel('Unfollow')
                .setStyle(ButtonStyle.Danger)
                .setDisabled(false)
        )
    }

    row.addComponents(
        new ButtonBuilder()
            .setCustomId('next_embed')
            .setLabel('>')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(pages[id] === pageCount - 1)
    )

    return row;
}

/**
 * @remarks
 * This function generates the Discord embeds for each manga in the mangaArr
 * 
 * @param {any[]} mangaArr Array of manga objects from a HTTPS request.
 * @param {ChatInputCommandInteraction} interaction The interaction that triggered the command.
 * @returns {Collector, embeds, pages} Object containing the button collector, the array of Discord embeds and pages key-value pair.
 */
export const GetEmbedPagination = async (mangaArr: any[], interaction: ChatInputCommandInteraction) => {
    // Create the embeds
    let mangaEmbeds: EmbedBuilder[] = [];
    const pages = {} as {[key: string]: number};

    for(let i = 0; i < mangaArr.length; i++){
        const mangaContent = await FindMangaByTitle(mangaArr[i].hid) || "err";
        mangaEmbeds.push(await GetMangaEmbed(mangaContent));
    }

    const time = 1000 * 60 * 5;
    const id = interaction.user.id;
    pages[id] = pages[id] || 0;

    const embed = mangaEmbeds[pages[id]];

    return {
        "collector": (await interaction.followUp({ embeds: [embed], components: [GetEmbedRow(id, pages, mangaEmbeds.length, "follow")] })).createMessageComponentCollector({time}),
        "embeds": mangaEmbeds,
        "pages": pages
    }
}
/**
 * Small method to get the follow button interaction menu components.
 * 
 * @returns {{ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<ButtonBuilder>}} Object containing the select menu and the return button builders.
 */
export const GetFollowDropDownMenu = () => {
    return {
        "string_select_menu_builder": new ActionRowBuilder<StringSelectMenuBuilder>()
                .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId("select")
                    .setPlaceholder('Output location.')
                    .addOptions({
                        label: 'Direct Message',
                        description: 'Get notified in your direct messages',
                        value: 'dm'
                    },
                    {
                        label: 'Channel',
                        description: 'Get notified in this channel',
                        value: 'channel'
                    })),
        "return_button_builder": new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('close_follow_menu')
                        .setLabel('Back to list')
                        .setStyle(ButtonStyle.Danger)
                )
        }
}

/**
 * 
 * @param {string} identifier The title of the comic to be tracked.
 * @param {string} channelID The id of the channel to be notified.
 */
export const UpdateTrackedManga = async (identifier: string, channelID: string) => {
    console.log(`MangaHID: ${identifier}, channelID: ${channelID}`);
    
    if(await Comic.exists({ slug: identifier})){
        if(await Comic.exists({ slug: identifier, channels: channelID }))
            return;

        await Comic.find({slug: identifier}).updateOne({ $push: { channels: channelID } });
    } else {
        //TODO: Issue #6: This is the cause of the bad URL.
        const manga = await FindMangaByTitle(identifier);
        if(manga === null) {
            console.error(`[UpdateTrackedManga] Error finding manga via identifier: ${identifier}\nManga:\n${manga}`);
            return;
        };
        Comic.create({
            title: manga.comic.title,
            latestChapter: manga.comic.last_chapter,
            imageURL: manga.comic.cover_url,
            description: manga.comic.desc.replace(/<[^>]*>?/gm, '').substring(0, 200) || "No description found.",
            author: manga.authors[0].name,
            channels: [channelID],
            slug: manga.comic.slug,
            hid: manga.comic.hid
        })        
    }
}

export const GetSummaryEmbed = (titles: string[], owner: string): EmbedBuilder => {
    const embed: EmbedBuilder = new EmbedBuilder()
        .setColor(7419530)
        .setTitle(`${owner}'s Followed comic (${titles.length}) list`)
        .setTimestamp()

    let desc: string = "";
    for(let i = 0; i < titles.length; i++){
        if(i == 0){
            // 1. One Piece
            desc += `${i + 1}. ${titles[i]}`;
        } else {
            // 1. One Piece
            // 2. Naruto
            desc += `\n${i + 1}. ${titles[i]}`;
        }
        desc += `\n`;
    }
    embed.setDescription(desc);

    return embed;
}