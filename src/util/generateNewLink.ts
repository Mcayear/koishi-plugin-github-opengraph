
import { parse } from 'url';
import { createHash } from 'crypto';

// 解析链接并生成带随机哈希值的新链接
export function generateNewLink(originalUrl: string): string | null {
  // 首先，我们需要检查原始链接是否是有效的GitHub链接
  // 我们可以使用url模块的parse函数来解析原始链接，并获取它的主机名和路径名
  const parsedUrl = parse(originalUrl);
  const hostname = parsedUrl.hostname;
  const pathname = parsedUrl.pathname;

  // 然后，我们需要判断主机名是否是github.com，如果不是，我们就返回null
  if (hostname !== 'github.com') {
    return null;
  }

  // 接下来，我们需要判断路径名是否是有效的GitHub仓库或者问题或者拉取请求的路径
  // 我们可以使用正则表达式来匹配路径名的格式，如果不匹配，我们也返回null
  const regex = /^\/[\w-]+\/[\w-]+(\/issues\/\d+|\/pull\/\d+)?$/;
  if (!regex.test(pathname)) {
    return null;
  }

  // 最后，我们需要生成一个随机的哈希值，并拼接成新的链接
  // 我们可以使用crypto模块的createHash函数来创建一个sha256哈希对象，并用update函数来更新它
  // 然后，我们可以用digest函数来获取哈希值的十六进制字符串，并截取前8位作为哈希值
  const hash = createHash('sha256').update(originalUrl).digest('hex').slice(0, 8);

  // 然后，我们可以用模板字符串来拼接新的链接，使用opengraph.githubassets.com作为主机名，并在路径名前加上哈希值
  const newUrl = `https://opengraph.githubassets.com/${hash}${pathname}`;

  // 返回新的链接
  return newUrl;
}