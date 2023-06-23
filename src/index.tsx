import { Context, Schema } from 'koishi'
import { generateNewLink } from './util/generateNewLink'
import { exactRegex, extractGitHubUrls } from './util/matchGitHubUrls';

export const name = 'github-opengraph'

class GithubOpengraph {
  constructor(ctx: Context, config: GithubOpengraph.Config) {
    const enablePlatform:string[] = [];
    for (let key in config.enablePlatform) {
      if (config.enablePlatform[key]) {
        enablePlatform.push(key);
      }
    }
    ctx.middleware(async (session, next) => {
      const user = await session.getUser(session.userId);
      if (!session.content.startsWith(config.startsWith)) {
        return next();
      }
      if (config.debug) {
        console.log(session.toJSON());
      }
      if (config.disableGroup && session.guildId) {// 禁止群聊，但是会话是群聊。如果未命中列表则return
        if (config.banGroupList.indexOf(session.guildId) === -1) {
          return next();
        }
      }
      if (!config.disableGroup && session.guildId) {// 允许群聊，但是会话是群聊。如果命中列表则return
        if (config.banGroupList.indexOf(session.guildId) > -1) {
          return next();
        }
      }
      if (config.disablePrives && !session.guildId) {// 禁止私聊，但是会话是私聊。如果未命中列表则return
        if (config.banPrivesList.indexOf(session.userId) === -1) {
          return next();
        }
      }
      if (!config.disablePrives && !session.guildId) {// 允许私聊，但是会话是私聊。如果命中列表则return
        if (config.banPrivesList.indexOf(session.userId) > -1) {
          return next();
        }
      }
      if (enablePlatform.indexOf(session.platform.split(":")[0]) === -1) {
        return next();
      }
      if (config.matchMode === matchMode.EXACT && exactRegex.test(session.content)) {
        let pictureLink = generateNewLink(session.content);
        if (pictureLink == null) {
          return next();
        }
        session.send(<image url={pictureLink}/>);
      } else if (config.matchMode === matchMode.FUZZY) {
        let list:string[] = extractGitHubUrls(session.content);

        let images = list.map(url => <image url={url}/>);
        let div = <div>{images}</div>;
        
        session.send(div);
      }
    });
  }
}
enum matchMode {
  EXACT = "exact",
  FUZZY = "fuzzy"
}

namespace GithubOpengraph {
  export interface Config {
    debug: boolean;
    startsWith: string;
    matchMode: matchMode;
    enablePlatform: {
      sandbox: boolean;
      onebot: boolean;
      telegram: boolean;
      discord: boolean;
      kook: boolean;
    };
    disablePrives: boolean;
    banPrivesList: string[];
    disableGroup: boolean;
    banGroupList: string[];
  }
  export const Config: Schema<Config> = Schema.object({
    debug: Schema.boolean().default(false).description("开启时会打印符合`匹配字符串开头`的会话所有信息"),
    startsWith: Schema.string().description("匹配字符串的开头").default("https://github.com"),
    matchMode: Schema.union([matchMode.EXACT, matchMode.FUZZY]).default(matchMode.EXACT).description('匹配模式<br>exact为完全匹配，当发送的消息有且只有`https://github.com/xxx/xx`<br>fuzzy为模糊匹配当发送的消息包含`https://github.com/xxx/xx`'),
    disablePrives: Schema.boolean().description("禁用私聊").default(false),
    banPrivesList: Schema.array(Schema.string()).role("table").description("私聊允许列表/禁止列表  当`禁用私聊`选项开启时是允许列表效果反之是禁止列表"),
    disableGroup: Schema.boolean().description("禁用群聊").default(false),
    banGroupList: Schema.array(Schema.string()).role("table").description("群聊允许列表/禁止列表  当`禁用私聊`选项开启时是允许列表效果反之是禁止列表"),
    enablePlatform: Schema.object({
      sandbox: Schema.boolean().default(true),
      onebot: Schema.boolean().default(true),
      telegram: Schema.boolean().default(false),
      discord: Schema.boolean().default(false),
      kook: Schema.boolean().default(false)
    }).description("启用平台，未启用则不会响应"),
  })
}

export default GithubOpengraph;