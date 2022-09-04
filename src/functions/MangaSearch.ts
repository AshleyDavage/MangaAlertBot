// TODO: Add the ability to search for a manga by the name given by the user.
// This should return an array of search results for the title.
import axios from 'axios';

export const MangaSearch = async (url: string) => {
    const response: any = await axios.get(url);
    let mangaArr: any[] = [];

    if(response.status === 200) {
        const iterator: number = 0;
        console.log(response.data.length);
        response.data.forEach((manga: any) => {
            if(iterator < 10){
                mangaArr.push(manga);
            }
        })
    }

    return mangaArr;
}