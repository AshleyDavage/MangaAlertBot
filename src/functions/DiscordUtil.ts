import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import config from "../config.json";

export const MangaEmbedGenerator = async (manga: any, timeTaken: number): Promise<EmbedBuilder> => {
    manga == "err" ? manga = {} : manga = manga;
    if(manga.comic.title === undefined) { return new EmbedBuilder().setTitle("Broken Result :("); }

    const descStrip = manga.comic.desc?.replace(/<[^>]*>?/gm, '') || "No description found.";
    
    const embed = new EmbedBuilder()
        .setColor(7419530)
        .setTitle(manga.comic.title)
        .setURL(`${config.WEBSITE_URL}/comic/${manga.comic.slug}`)
        .setDescription(descStrip)
        .setImage(manga.comic.cover_url)
        .setTimestamp()
        .setFooter({ text: `Information from comick.fun  -  ping: ${Date.now() - timeTaken}ms` })

    if(manga.authors.length > 0){
        embed.setAuthor({ name: `Author: ${manga.authors[0].name}` })
    } else {
        embed.setAuthor({ name: `Author: Unknown` });
    }

    return embed;
}

export const GetEmbedRow = (id: string, pages: any) => {
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

    row.addComponents(
        new ButtonBuilder()
            .setCustomId('next_embed')
            .setLabel('>')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(pages[id] === pages.length - 1)
    )

    return row;
}