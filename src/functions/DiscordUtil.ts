import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, EmbedBuilder, StringSelectMenuBuilder } from "discord.js";
import config from "../config.json";
import { FindMangaByTitle } from "./MangaAPI";
import { Comic, IComic } from "../models/comic";
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
        /* row.addComponents(
            new ButtonBuilder()
                .setCustomId('unfollow_manga')
                .setLabel('Unfollow')
                .setStyle(ButtonStyle.Danger)
                .setDisabled(false)
        ) */
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
export const GetMangaEmbedPagination = async (mangaArr: any[], interaction: ChatInputCommandInteraction) => {
    // Create the embeds
    let mangaEmbeds: EmbedBuilder[] = [];
    const pages = {} as {[key: string]: number};

    for(let i = 0; i < mangaArr.length; i++){
        const mangaContent = await FindMangaByTitle(mangaArr[i].hid) || "err";
        mangaEmbeds.push((await GetMangaEmbed(mangaContent)).setFooter({text: `Page ${i + 1}/${mangaArr.length}`}));
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
 * 
 * @param {any[]} followedComics JSON object array of comics the "owner" follows.
 * @param {string} owner The owner of the comic list. Either USERNAME OR CHANNELNAME.
 * @returns {EmbedBuilder[]} An array of Discord embeds.
 */
// Looping to create an array of manga embeds
export const GetFollowedListEmbeds = async (followedComics: IComic[], owner: string): Promise<EmbedBuilder[]> => {
    const embeds: EmbedBuilder[] = [];

    // We want each embed to have 10 comic titles.
    // So we loop from 0 to the amount of comics divided by ten rounded up. 
    // (7 / 10 = 0.7 ceil(0.7) = 1, 11 -> 2, 23 -> 3)
    // Amount of pages to create
    for(let i = 0; i < Math.ceil(followedComics.length / 10); i++){
        // Create an embed with the "i" 10 comics.
        // i = 0 * 10 = 0; i = 1 * 10 = 10; i = 2 * 10 = 20;
        const start = i * 10;
        // End = start + 10; start = 0 + 10 = 10; start = 10 + 10 = 20;
        embeds.push(GetSummaryEmbed(followedComics, owner, start, start + 10));
    }

    return embeds;
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
                        description: 'Your direct messages',
                        value: 'dm'
                    },
                    {
                        label: 'Channel',
                        description: 'The current server channel',
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
 * Takes an array of comics and generates a Discord embed with the list of comics.
 * Each embed should have a maximum of 10 comics.
 * 
 * TODO: Fix JSON Object array types.
 * TODO: #5 Add functionality to be incorporated into Search/Random commands.
 * @param {IComic[]} comics JSON Object array of comics to be listed.
 * @param {string} owner The username/channel name of requested.
 * @param {number} pageStart The start index of the comics array.
 * @param {number} pageEnd The end index of the comics array.
 * @returns 
 */
export const GetSummaryEmbed = (comics: IComic[], owner: string, pageStart: number, pageEnd: number): EmbedBuilder => {
    const embed: EmbedBuilder = new EmbedBuilder()
        .setColor(7419530)
        .setTitle(`${owner}'s followed comic (${comics.length}) list`)
        .setTimestamp()
        .setFooter({text: `page: ${pageStart / 10 + 1}/${Math.ceil(comics.length / 10)}`})

    let desc: string = "";
    // pageStart = 0 -> 10 -> 20 -> 30
    // pageEnd = 10 -> 20 -> 30 -> 40

    //console.log(`pageStart: ${pageStart}\npageEnd: ${pageEnd}\nComic:${comics[pageStart]}\nComics length: ${comics.length}`);
    for(pageStart; pageStart < pageEnd; pageStart++){
        if(comics[pageStart] === undefined) break;
        if(pageStart == 0){
            desc += `${pageStart + 1}. ${comics[pageStart].title}`;
        } else {
            desc += `\n${pageStart + 1}. ${comics[pageStart].title}`;
        }
        desc += `\n`;
    }
    embed.setDescription(desc);

    return embed;
}

export const NewChapterEmbed = async (comic: any) => {
    return new EmbedBuilder()
        .setColor(7419530)
        .setTitle(`NEW CHAPTER!`)
        .setDescription(`${comic.md_comics.title} has a new chapter!\nChapter: ${comic.chap}\nRead now at Comick.fun: ${config.WEBSITE_URL}comic/${comic.md_comics.slug}/${comic.hid}-chapter-${comic.chap}-en`)
        .setURL(`${config.WEBSITE_URL}comic/${comic.md_comics.hid}`)
        .setImage(comic.md_comics.cover_url)
        .setTimestamp();
}