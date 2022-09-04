// TODO: Add the ability to search for a manga by the name given by the user.
// This should return an array of search results for the title.
import axios from 'axios';

export const MangaSearch = async (name: string) => {
    const response: any = await axios.get(`https://api.comick.fun/search?tachiyomi=true&q=${name}`);
    let mangaArr: any[] = [];

    if(response.status === 200) {
        const iterator: number = 0;
        response.data.forEach((manga: any) => {
            if(iterator < 10){
                mangaArr.push(manga);
            }
        })
    }

    return mangaArr;
}