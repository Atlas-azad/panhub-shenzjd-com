<script setup lang="ts">
// 隐私政策页：胖虎聚合网盘搜索 — 免费开箱即用，最小化收集
useSeoMeta({
  title: "隐私政策 - 胖虎聚合网盘搜索",
  description: "胖虎聚合网盘搜索隐私政策：说明本站的数据收集与使用方式。",
  robots: "index,follow",
});
</script>
 
<template>
  <div class="privacy-page">
    <div class="privacy-card">
      <h1>隐私政策</h1>
      <p class="updated">更新日期：2026-09-05</p>
      <p class="intro">
        胖虎聚合网盘搜索（以下简称"本站"）是一个免费、开箱即用的网盘资源聚合搜索工具，
        无需注册、无需登录、无需关注公众号，打开即用。我们高度重视你的隐私，
        以下详细说明本站的数据处理方式。
      </p>
 
      <section>
        <h2>一、我们收集的信息</h2>
        <ul>
          <li>
            <strong>搜索关键词</strong>：你输入的关键词仅用于当次请求的实时检索，
            不会写入任何持久化存储（磁盘、数据库），不会用于生成热搜榜单、用户画像
            或任何统计分析展示。关键词长度上限 200 字符，超出部分自动截断。
          </li>
          <li>
            <strong>客户端 IP 地址</strong>：服务端获取你的 IP 仅用于请求频率限制
            （限流），防止接口被暴力调用。IP 不与搜索关键词关联，不做持久化存储。
            限流计数器全部存储在服务端内存中，服务重启即清零。
          </li>
          <li>
            <strong>浏览器 User-Agent</strong>：服务端解析 UA 仅用于识别自动化脚本
            和爬虫——bot UA 的请求会被拦截（返回 403），保护服务器资源不被脚本刷占。
            UA 不做持久化存储，也不用于设备指纹追踪。
          </li>
          <li>
            <strong>服务端运行日志</strong>：为保障服务可用性，服务端可能产生临时
            运行日志（如请求异常、插件超时、上游数据源不可达等），仅用于故障定位
            与运维观察。日志不包含你的搜索关键词，不与你的身份关联持久化存储。
          </li>
        </ul>
        <p class="highlight">
          本站不收集你的姓名、手机号、邮箱、身份证号等任何个人身份信息。
          本站不要求你注册账号或登录。本站不使用 Cookie 追踪你的行为。
        </p>
      </section>
 
      <section>
        <h2>二、信息的使用目的</h2>
        <ul>
          <li>
            <strong>提供搜索服务</strong>：你输入的关键词发送至后端，由多个搜索插件
            （聚合阿里云盘、夸克网盘、百度网盘、115网盘、迅雷云盘、UC网盘、天翼云盘、
            123网盘、移动云盘等平台）和 Telegram 频道数据源并发检索，结果通过
            SSE（Server-Sent Events）流式实时返回前端。关键词在检索完成后不落盘、
            不留痕。
          </li>
          <li>
            <strong>请求频率限制</strong>：基于客户端 IP 做固定窗口限流——
            搜索接口 60 次/分钟、链接检测接口 15 次/分钟。此为防滥用必要措施，
            计数仅存内存，重启即消失。
          </li>
          <li>
            <strong>链接有效性检测</strong>：搜索结果渲染后，前端异步调用
            <code>/api/check</code> 探测链接是否存活（可达 / 失效 / 需密码 / 不支持），
            检测结果在服务端做分级 TTL 缓存（同链接不重复探测），全部存于内存，
            不持久化。
          </li>
          <li>
            <strong>防滥用拦截</strong>：通过 User-Agent 识别脚本/爬虫直调 API 的行为，
            未携带有效凭证的自动化请求将被拦截。本站免费开放，此举仅为保障所有用户
            的搜索体验，不用于追踪。
          </li>
          <li>
            <strong>搜索结果缓存</strong>：服务端对搜索结果做内存级 LRU 短时缓存
            （默认 30 分钟 TTL，最多 300 条 / 64MB），用于相同关键词的重复查询
            加速。缓存不包含用户身份信息，过期自动淘汰，重启清零。
          </li>
        </ul>
      </section>
 
      <section>
        <h2>三、信息的存储与保留</h2>
        <ul>
          <li>
            <strong>本站不设用户数据库</strong>，不持久化存储搜索记录、个人身份信息
            或任何用户行为数据。没有用户表、没有搜索历史表、没有任何持久化用户数据。
          </li>
          <li>
            <strong>所有缓存均为内存级、TTL 过期、重启即清零</strong>：
            <ul>
              <li>搜索结果缓存：LRU 策略，最多 300 条 / 64MB，默认 30 分钟 TTL，
                过期自动淘汰；</li>
              <li>限流计数器：内存 Map，最多 10 万条记录，5 分钟周期清理过期项；</li>
              <li>链接检测结果缓存：分级 TTL，同一链接不重复探测，过期自动清除；</li>
              <li>豆瓣热门数据缓存：24 小时 TTL，仅缓存热搜内容本身，不含用户信息。</li>
            </ul>
          </li>
          <li>
            <strong>Cookie</strong>：本站核心功能不使用任何 Cookie。搜索、浏览、
            链接检测均无需 Cookie 即可完成。
          </li>
          <li>
            <strong>localStorage / sessionStorage</strong>：本站不使用 localStorage
            或 sessionStorage 存储任何用户数据或追踪标识。
          </li>
          <li>
            <strong>暗色模式</strong>：纯跟随系统 <code>prefers-color-scheme</code>
            媒体查询实时响应，不写入任何持久化存储，不记录你的主题偏好。
          </li>
        </ul>
      </section>
 
      <section>
        <h2>四、信息的共享与披露</h2>
        <ul>
          <li>
            <strong>我们不与任何第三方共享你的个人信息</strong>——因为本站不收集、
            不持久化存储个人信息。无数据可共享。
          </li>
          <li>
            <strong>搜索请求的数据流转</strong>：你输入的关键词会发送至本站后端，
            后端将其转发至配置的搜索数据源（Telegram 频道、第三方网盘搜索站点等）
            执行检索。这些第三方数据源有其各自的隐私政策，本站无法控制其数据处理
            行为。关键词在转发过程中不附加你的任何身份信息（无 IP、无 Cookie、
            无用户 ID）。
          </li>
          <li>
            <strong>链接检测的数据流转</strong>：链接有效性检测时，本站服务端会
            向目标网盘链接发起 HEAD 请求探测可达性。探测请求携带目标 URL，不携带
            你的身份信息。部分需密码的链接会在请求中附带提取码（由搜索结果中提取），
            仅用于探测，不存储。
          </li>
          <li>
            <strong>法律要求</strong>：在法律法规要求或政府主管部门依法要求的情况下，
            我们可能披露必要的信息。鉴于本站不持久化存储用户个人数据，实际可披露
            的数据极为有限。
          </li>
        </ul>
      </section>
 
      <section>
        <h2>五、你的权利</h2>
        <ul>
          <li>
            <strong>无需注册，无需登录</strong>：本站不要求你提供任何身份信息，
            也不存储任何可关联到你个人的数据。你随时可以使用，随时可以离开，
            无需"注销账号"——因为没有账号。
          </li>
          <li>
            <strong>无数据可删除</strong>：本站不持久化存储你的搜索记录或身份信息，
            因此不存在"删除我的数据"的必要——你的数据在使用后即从内存中自然过期
            或随服务重启而消失。
          </li>
          <li>
            <strong>拒绝自动化追踪</strong>：本站不使用任何第三方分析工具
            （如 Google Analytics、百度统计等）、不植入追踪像素（tracking pixel）、
            不做设备指纹（device fingerprinting）、不使用任何广告追踪 SDK。
          </li>
          <li>
            <strong>拒绝 Cookie</strong>：你可以在浏览器中禁用 Cookie，不影响本站
            任何核心功能的使用。搜索、浏览结果、链接检测均正常工作。
          </li>
          <li>
            <strong>自主选择搜索源</strong>：你可以自由选择搜索哪些平台
            （阿里云盘、夸克、百度网盘等），也可以选择只搜索 Telegram 频道或
            只搜索插件源。你的搜索范围选择不会被记录。
          </li>
        </ul>
      </section>
 
      <section>
        <h2>六、安全措施</h2>
        <ul>
          <li>
            <strong>限流防 DoS</strong>：IP 级固定窗口限流，搜索接口 60 次/分钟、
            链接检测 15 次/分钟，防止接口被暴力调用。限流 store 上限 10 万条，
            超限时优先清理过期项，仍超则降级放行（宁可漏限，不可被内存打挂）。
          </li>
          <li>
            <strong>插件错误隔离</strong>：各搜索插件独立运行，单个插件异常
            （超时、返回错误、数据格式异常等）不会影响其他插件或整体搜索服务的
            可用性。每个插件设有独立的熔断器，连续失败后自动熔断，避免持续
            消耗服务器资源。
          </li>
          <li>
            <strong>代理头不信任</strong>：默认不信任 X-Forwarded-For 等代理头
            中的 IP，防止攻击者伪造 IP 绕过限流。仅在部署环境显式配置
            <code>TRUST_PROXY=1</code>（确认前置了 Cloudflare 等可信反代）
            时才读取代理头中的 IP。
          </li>
          <li>
            <strong>搜索关键词长度限制</strong>：关键词最长 200 字符，超出自动截断，
            防止超长输入消耗服务器资源。
          </li>
          <li>
            <strong>链接检测安全限制</strong>：单次检测最多 50 个链接，
            单个 URL 最长 500 字符，防止恶意提交海量链接打爆服务。
          </li>
          <li>
            <strong>结果分页控制</strong>：每轮搜索最多返回 90 条结果，
            达到上限自动暂停，需你手动点击"继续"才会搜索更多。此举既节省
            服务器资源，也避免一次性返回海量结果影响体验。
          </li>
        </ul>
      </section>
 
      <section>
        <h2>七、第三方服务</h2>
        <p>
          本站的搜索能力依赖以下第三方数据源，这些服务各自有其隐私政策，
          本站无法控制其数据处理行为：
        </p>
        <ul>
          <li>
            <strong>Telegram 频道</strong>：本站通过 Telegram API 抓取公开频道的
            分享链接信息。你的搜索关键词会作为查询条件发送至 Telegram API。
            Telegram 的数据处理受其隐私政策约束。
          </li>
          <li>
            <strong>第三方网盘搜索站</strong>：本站通过插件形式对接多个第三方
            网盘搜索站点（如盘搜、易搜等），将你的搜索关键词转发至这些站点执行
            检索。这些站点各自的数据处理规则请参阅其自身隐私政策。
          </li>
          <li>
            <strong>CDN 服务</strong>：本站可能使用 CDN（如 unpkg、jsDelivr 等）
            加载前端依赖库（如 wx-auth-sdk UMD 包）。这些 CDN 可能记录你的 IP
            和请求日志，受其各自隐私政策约束。
          </li>
        </ul>
      </section>
 
      <section>
        <h2>八、儿童隐私</h2>
        <p>
          本服务不面向 14 周岁以下儿童，不 knowingly 收集儿童的个人信息。
          如果你是监护人并发现儿童未经同意使用了本服务，无需担忧——
          本站不持久化存储任何个人数据，使用痕迹会在内存中自然过期。
          我们不会也无需对儿童信息做特别处理，因为我们根本不存储用户信息。
        </p>
      </section>
 
      <section>
        <h2>九、开源与透明</h2>
        <p>
          本站为开源项目，全部源代码可供审查。你可以自行部署、自行审计、
          自行修改。本隐私政策中的每一条声明都有对应的代码实现作为依据——
          我们不说没有代码支撑的空话。
        </p>
      </section>
 
      <section>
        <h2>十、政策变更</h2>
        <p>
          我们可能不时更新本隐私政策。重大变更会在本页面更新日期处标注。
          继续使用本站服务即视为接受更新后的政策。鉴于本站不存储你的联系方式，
          无法逐一通知变更，请定期查看本页面。
        </p>
      </section>
    </div>
  </div>
</template>
 
<style scoped>
.privacy-page {
  max-width: 760px;
  margin: 0 auto;
  padding: 32px 20px 64px;
  color: var(--text-color, #1f2937);
}
.privacy-card {
  background: var(--card-bg, #fff);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 12px;
  padding: 28px 32px;
  line-height: 1.8;
}
.privacy-card h1 {
  font-size: 24px;
  margin: 0 0 4px;
}
.privacy-card .updated {
  color: var(--muted-color, #6b7280);
  font-size: 13px;
  margin-bottom: 4px;
}
.privacy-card .intro {
  color: var(--muted-color, #6b7280);
  font-size: 14px;
  margin-bottom: 20px;
}
.privacy-card .highlight {
  background: var(--border-color, #f3f4f6);
  border-left: 3px solid var(--accent-color, #2563eb);
  padding: 10px 14px;
  margin: 12px 0;
  border-radius: 0 6px 6px 0;
  font-size: 14px;
}
.privacy-card h2 {
  font-size: 17px;
  margin: 20px 0 8px;
}
.privacy-card ul {
  padding-left: 20px;
  margin: 8px 0;
}
.privacy-card li {
  margin: 4px 0;
}
.privacy-card a {
  color: var(--accent-color, #2563eb);
}
.privacy-card code {
  background: var(--border-color, #e5e7eb);
  padding: 1px 5px;
  border-radius: 3px;
  font-size: 0.9em;
}
</style>
