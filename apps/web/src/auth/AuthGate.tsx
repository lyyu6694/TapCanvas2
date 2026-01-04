import React from 'react'
import { Group, Tabs } from '@mantine/core'
import GithubGate from './GithubGate'
import EmailGate from './EmailGate'

/**
 * 统一的认证门户，支持 GitHub 和邮箱两种方式
 */
export default function AuthGate({ children, className }: { children: React.ReactNode; className?: string }) {
  // 尝试从 GithubGate 渲染
  const renderGitHub = () => (
    <GithubGate className={className}>
      {children}
    </GithubGate>
  )

  // 如果 GithubGate 有认证成功的 token，会自动调用 children
  // 否则显示登录选项

  return (
    <EmailGate className={className}>
      {renderGitHub()}
    </EmailGate>
  )
}
