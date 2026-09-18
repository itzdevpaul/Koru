import React from 'react'

interface State { hasError: boolean }

export default class AppErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.error('[Koru] Unhandled UI error:', error)
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <main className="grid min-h-screen place-items-center px-6 py-12 text-center">
        <section className="max-w-md rounded-3xl border border-[#A2BFA6]/30 bg-white/80 p-8 shadow-sm dark:bg-[#142B1F]">
          <h1 className="text-2xl font-bold text-[#1B3B2B] dark:text-[#E8F5EA]">Koru needs a refresh</h1>
          <p className="mt-3 text-sm leading-6 text-[#527060] dark:text-[#B9D6C0]">Something unexpected interrupted this screen. Your saved data is still safe.</p>
          <button type="button" onClick={() => window.location.reload()} className="mt-6 min-h-11 rounded-xl bg-[#1B3B2B] px-5 py-3 font-semibold text-white">Refresh Koru</button>
        </section>
      </main>
    )
  }
}
