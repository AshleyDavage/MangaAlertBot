# **Manga Alert Bot**
## A Discord bot that finds and tracks manga.
This discord bot is designed to find manga with a given name, list random manga with optional filters, track the manga for individual users, and alert the subscribed users/channels when new chapters are released.

#### **Current Goals**:

- [x] Find random manga
    - [x] Show random manga as embed
    - [x] Find multiple random manga
    - [x] Enable pagination on Discord embeds to display all the found manga

- [ ] Find specific manga
    - [ ] Show specific manga as embed
    - [ ] Add button to "track" manga
    - [ ] Add button to "untrack" manga

- [ ] Create user functionaltiy
    - [ ] Store which manga a user tracks
    - [ ] Remove manga from user's tracked manga
    - [ ] Show user's tracked manga
    - [ ] Share user's tracked manga

- [ ] Create bot to check which mangas have updated
    - [ ] Add mangas to be tracked
    - [ ] Loop through mangas to compare the stored chapter and current chapter
    - [ ] Notify users when a manga has updated

- [ ] Create channel functionality
    - [ ] Output manga updates to a specified channel


#### **Starting Goals**:
- [X] Create boilerplate typescript bot
- [X] Create slash command handler
- [X] Create ping command to check delay
 

## **Installation**
1. Clone repository
> Ensure you have Node 16.15 or higher installed
2. Run `npm install` to install dependencies
3. Create a `.env` file in the root directory and add your bot token, as well as the URL for the websites you wish to use as a source.
4. Change the functions that are specific to URLs `You will need to have an understanding of API Requests and TypeScript`.
5. Run `npm start` to start the bot.

If you do not want to setup the bot in a local environment and change the necessary code blocks, you will be able to invite it to Discord servers in the future.
