export const exactRegex = /^https:\/\/github\.com\/[\w-]+\/[\w-]+(\/[\w-]+)*/;

export const fuzzyRegex = /https:\/\/github\.com\/[\w-]+\/[\w-]+(\/[\w-]+)*/g;

// 从一堆文字中提取出 https://github.com/xxx/xxx/xxx 链接
export function extractGitHubUrls(text: string): string[] {
    // 定义一个空数组来存放提取出的链接
    const urls: string[] = [];
  
    // 定义一个正则表达式来匹配GitHub链接的格式
    // 我们假设链接以https开头，并且包含github.com域名和至少两个斜杠分隔的部分
  
    // 使用match方法来获取文本中所有符合正则表达式的子串，并返回一个数组或者null
    const matches = text.match(fuzzyRegex);
  
    // 如果返回值不是null，说明有匹配到的链接，我们就遍历这个数组，并把每个元素添加到urls数组中
    if (matches) {
      for (const match of matches) {
        urls.push(match);
      }
    }
  
    // 返回urls数组
    return urls;
}