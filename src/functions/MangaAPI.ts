import axios from 'axios';

// Finds manga with selected criteria and returns them in an array.
// returns maximum 50
export const Search = async (url: string, amount: number = 10) => {
    const response: any = await axios.get(url);
    let mangaArr: any[] = [];

    if(response.status === 200) {
        let iterator: number = 0;
        response.data.forEach((manga: any) => {
            if(iterator < amount){
                mangaArr.push(manga);
                iterator++;
            }
        })
    }
    return mangaArr;
}

export const FindMangaByTitle = async (url: string) => {
    const response: any = await axios.get(url);
    if(response.status === 200){
        return response.data;
    } else {
        return null;
    }
}