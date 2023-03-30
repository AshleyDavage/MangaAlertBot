// TODO: This is a co-routine that should run at all times to keep checking whether there is a new chapter.
// If there is a difference between the data we should output the latest information to the specified feeds/users.

// We can check the latest comics to see what has been released.

// 5 minute intervals
// We can loop through first page results until we get to the previous latest chapter.
//      If database contains this chapter and chapter is larger than currently stored
//        Update database with new chapter
//        Generate Embed with new chapter information
//        Send message to all channels subscribed to this manga
//        for(let i = 0; i < channels.length; i++){
//            const channel = client.channels.fetch(placeholder[i]).then(channel => {
//                if(channel?.isTextBased()){
//                   channel.send({ embeds: [embeds[pages[id]]]});
//                }
//            });
//        }                    