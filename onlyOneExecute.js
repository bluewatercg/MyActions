const exec = require("child_process").execSync;
const fs = require("fs");
const download = require("download");
const smartReplace = require("./smartReplace");

// 公共变量
const Secrets = {
    JD_COOKIE: process.env.JD_COOKIE, //cokie,多个用&隔开即可
    SyncUrl: process.env.SYNCURL, //签到地址,方便随时变动
    PUSH_KEY: process.env.PUSH_KEY, //server酱推送消息
    BARK_PUSH: process.env.BARK_PUSH, //Bark推送
    MarketCoinToBeanCount: process.env.JDMarketCoinToBeans, //京小超蓝币兑换京豆数量
    JoyFeedCount: process.env.JDJoyFeedCount, //宠汪汪喂食数量
    FruitShareCodes: process.env.FruitShareCodes, //京东农场分享码
};

async function downFile() {
    await download(Secrets.SyncUrl, "./", { filename: "temp.js" });
    console.log("下载代码完毕");
    if (Secrets.PUSH_KEY || Secrets.BARK_PUSH) {
        await download("https://github.com/lxk0301/scripts/raw/master/sendNotify.js", "./", {
            filename: "sendNotify.js",
        });
        console.log("下载通知代码完毕");
    }
    //如果yaml文件中没有配置对应的env参数,则是读不到数据的,所以直接判断即可
    if (Secrets.FruitShareCodes) {
        await download("https://github.com/lxk0301/scripts/raw/master/jdFruitShareCodes.js", "./", {
            filename: "jdFruitShareCodes.js",
        });
        console.log("下载农场分享码代码完毕");
    }
}

async function changeFiele() {
    let content = await fs.readFileSync("./temp.js", "utf8");
    content = smartReplace.replaceWithSecrets(content, Secrets);
    await fs.writeFileSync("./onlyOneExecute.js", content, "utf8");
    console.log("替换变量完毕");
}

async function start() {
    console.log(`当前执行时间:${new Date().toString()}`);
    if (!Secrets.JD_COOKIE) {
        console.log("请填写 JD_COOKIE 后在继续");
        return;
    }
    if (!Secrets.SyncUrl) {
        console.log("请填写 SYNCURL 后在继续");
        return;
    }
    console.log(`当前共${Secrets.JD_COOKIE.split("&").length}个账号需要签到`);
    try {
        await downFile();
        await changeFiele();
        await exec("node onlyOneExecute.js", { stdio: "inherit" });
    } catch (e) {
        console.log("执行异常:" + e);
    }
    console.log("执行完毕");
}

start();
