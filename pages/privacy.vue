<script setup lang="ts">
// 隐私政策页：开源版不记录搜索词/身份标识/搜索日志，最小化收集
useSeoMeta({
  title: "隐私政策 - 胖虎 网盘搜索",
  description: "胖虎 隐私政策：说明本站的数据收集与使用方式。",
  robots: "index,follow",
});
</script>
 
<template>
  <div class="privacy-page">
    <div class="privacy-card">
      <h1>隐私政策</h1>
      <p class="updated">更新日期：2026-09-05</p>
 
      <section>
        <h2>一、我们收集的信息</h2>
        <ul>
          <li>
            <strong>搜索关键词</strong>：你输入的关键词仅用于当次请求的实时检索，
            不会写入任何持久化存储（磁盘、数据库），不会用于生成热搜榜单、
            用户画像或任何统计展示。服务端在内存中对搜索结果做短时缓存
            （最多 300 条、64MB、TTL 过期自动淘汰），服务重启后全部清零。
          </li>
          <li>
            <strong>认证凭证</strong>：搜索前须完成微信公众号认证（关注公众号 +
            验证码）。认证通过后，wx-auth SDK 在<strong>你当前域名</strong>下写入
            <code>wxauth-token</code> Cookie（有效期 1 年），用于后续搜索时静默
            验证身份，避免反复弹窗。<strong>本站不存储你的 openid、头像、昵称等
            身份资料</strong>——这些信息由独立的 wx-auth 认证服务管理，本站仅
            转发校验请求、读取校验结果（是否已认证）。
          </li>
          <li>
            <strong>客户端 IP 地址</strong>：服务端获取你的 IP 仅用于请求频率限制
            （限流），不会与你的身份信息关联持久化。限流计数器全部存储在内存中
            （最多 10 万条记录），服务重启即清零。
          </li>
          <li>
            <strong>浏览器 User-Agent</strong>：服务端解析 UA 仅用于识别自动化脚本
            和爬虫（bot UA 无凭证时返回 403 拦截），不做持久化存储，也不用于
            设备指纹追踪。
          </li>
          <li>
            <strong>服务端运行日志</strong>：为保障服务可用性，服务端可能产生临时
            运行日志（如请求异常、认证失败、wx-auth 服务不可达等），仅用于
            故障定位与运维观察，不与你的身份关联持久化存储。
          </li>
        </ul>
      </section>
 
      <section>
        <h2>二、信息的使用目的</h2>
        <ul>
          <li>
            <strong>提供搜索服务</strong>：关键词发送至后端，由多个搜索插件和
            Telegram 频道数据源并发检索，结果实时返回前端。关键词不落盘，
            不留痕。
          </li>
          <li>
            <strong>认证与访问控制</strong>：wx-auth 认证服务校验登录态，仅返回
            "是否已认证"及 openid（用于同请求内的配额关联）。本站不获得
            你的昵称、头像或其他个人资料。
          </li>
          <li>
            <strong>请求频率限制</strong>：基于客户端 IP 做固定窗口限流——搜索接口
            60 次/分钟、链接检测接口 15 次/分钟。计数仅存内存，重启即消失。
          </li>
          <li>
            <strong>链接有效性检测</strong>：搜索结果渲染后，前端异步调用
            /api/check 探测链接是否存活（可达/失效/需密码），检测结果在
            服务端做分级 TTL 缓存（同链接不重复探测），全部存于内存。
          </li>
          <li>
            <strong>防滥用拦截</strong>：通过 User-Agent 识别脚本/爬虫直接调用 API
            的行为，未携带有效凭证的自动化请求将被拦截（403）。
          </li>
        </ul>
      </section>
 
      <section>
        <h2>三、信息的存储与保留</h2>
        <ul>
          <li>
            <strong>本站不设用户数据库</strong>，不持久化存储搜索记录、个人身份信息
            或任何用户行为数据。
          </li>
          <li>
            <strong>所有缓存均为内存级、TTL 过期、重启即清零</strong>：
            <ul>
              <li>搜索结果缓存：LRU 策略，最多 300 条 / 64MB，TTL 到期自动淘汰；</li>
              <li>wx-auth 认证缓存：同一凭证 10 分钟内只校验一次远程，缓存结果
                存内存 Map，10 分钟 TTL 到期失效；</li>
              <li>限流计数器：内存 Map，最多 10 万条，5 分钟周期清理过期项；</li>
              <li>链接检测结果缓存：分级 TTL，同链接不重复探测。</li>
            </ul>
          </li>
          <li>
            <strong>Cookie</strong>：仅 <code>wxauth-token</code>（认证令牌，
            1 年有效）和 <code>wxauth-openid</code>，均由 wx-auth SDK 写入，
            你可随时通过浏览器清除 Cookie 来撤销登录态。
          </li>
          <li>
            <strong>暗色模式</strong>：纯跟随系统 <code>prefers-color-scheme</code>
            媒体查询，不写入 localStorage 或任何持久化存储。
          </li>
        </ul>
      </section>
 
      <section>
        <h2>四、信息的共享与披露</h2>
        <ul>
          <li>
            <strong>我们不与任何第三方共享你的个人信息</strong>——因为本站不收集、
            不持久化存储个人信息。
          </li>
          <li>
            <strong>搜索请求的数据流转</strong>：你输入的关键词会发送至本站后端，
            后端将其转发至配置的搜索数据源（Telegram 频道、第三方网盘搜索站
            等）执行检索。这些数据源有其各自的隐私政策，本站无法控制其数据处理
            行为。关键词在转发过程中不附加你的身份信息。
          </li>
          <li>
            <strong>认证服务（wx-auth）</strong>：登录态由独立的 wx-auth 服务
            （wx-auth.shenzjd.com）管理。本站将你的认证凭证（Cookie 或 Bearer
            Token）转发至 wx-auth 的 /api/auth/check 接口做权威校验，wx-auth
            返回校验结果。wx-auth 的数据处理规则请参阅其自身隐私政策。
          </li>
          <li>
            <strong>法律要求</strong>：在法律法规要求或政府主管部门依法要求的情况下，
            我们可能披露必要的信息。鉴于本站不持久化存储用户数据，实际可披露
            的数据极为有限。
          </li>
        </ul>
      </section>
 
      <section>
        <h2>五、你的权利</h2>
        <ul>
          <li>
            <strong>撤销认证</strong>：取消关注微信公众号即等于退出登录。此后你的
            认证态将在最长 10 分钟内失效（受跨请求缓存 TTL 影响），后续搜索
            将重新要求认证。
          </li>
          <li>
            <strong>清除 Cookie</strong>：你可通过浏览器设置随时删除当前域名下的
            <code>wxauth-token</code> 和 <code>wxauth-openid</code> Cookie，
            效果等同于登出。
          </li>
          <li>
            <strong>无数据可删除</strong>：本站不持久化存储你的搜索记录或身份信息，
            因此不存在"删除我的数据"的必要——你的数据在使用后即从内存中自然
            过期或随服务重启而消失。
          </li>
          <li>
            <strong>拒绝自动化追踪</strong>：本站不使用任何第三方分析工具
            （如 Google Analytics）、不植入追踪像素、不做设备指纹。
            暗色模式纯跟随系统设置，无手动开关、无本地存储。
          </li>
        </ul>
      </section>
 
      <section>
        <h2>六、安全措施</h2>
        <ul>
          <li>
            <strong>服务端校验兜底</strong>：即使前端认证弹窗可被绕过，服务端
            对所有搜索请求强制校验 wx-auth 凭证（fail-closed 策略：认证服务
            不可达时拒绝请求，宁可误伤不裸奔）。
          </li>
          <li>
            <strong>限流防 DoS</strong>：IP 级固定窗口限流，防止接口被暴力调用。
            限流 store 上限 10 万条，超限时优先清理过期项，仍超则降级放行
            （宁可漏限，不可被内存打挂）。
          </li>
          <li>
            <strong>插件错误隔离</strong>：各搜索插件独立运行，单个插件异常不会
            影响其他插件或整体搜索服务的可用性（错误隔离门机制）。
          </li>
          <li>
            <strong>代理头不信任</strong>：默认不信任 X-Forwarded-For 等代理头
            中的 IP，防止攻击者伪造 IP 绕过限流。仅在你显式配置
            <code>TRUST_PROXY=1</code>（确认前置了 Cloudflare 等可信反代）
            时才读取代理头。
          </li>
          <li>
            <strong>Cookie SameSite</strong>：认证 Cookie 遵循浏览器的 SameSite
            策略，降低跨站请求伪造（CSRF）风险。
          </li>
        </ul>
      </section>
 
      <section>
        <h2>七、儿童隐私</h2>
        <p>
          本服务不面向 14 周岁以下儿童，不 knowingly 收集儿童的个人信息。
          如果你是监护人并发现儿童未经同意使用了本服务，无需担忧——
          本站不持久化存储任何个人数据，使用痕迹会在内存中自然过期。
        </p>
      </section>
 
      <section>
        <h2>八、政策变更</h2>
        <p>
          我们可能不时更新本隐私政策。重大变更会在本页面更新日期处标注。
          由于本站不存储你的联系方式，无法逐一通知，请定期查看本页面。
          继续使用本站服务即视为接受更新后的政策。
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
  margin-bottom: 20px;
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
