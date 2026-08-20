import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { TextPlugin } from 'gsap/TextPlugin'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(TextPlugin, ScrollTrigger)

export const useTypingAnimation = (ref, text, options = {}) => {
  // Stable options ref so inline option objects (fresh identity each render)
  // don't restart the tween on unrelated re-renders.
  const optionsRef = useRef(options)
  optionsRef.current = options

  useEffect(() => {
    if (!ref.current || !text) return
    const el = ref.current

    // Prevent flash of unstyled text before animation starts
    gsap.set(el, { opacity: 1 })
    el.textContent = ''

    const triggerEl =
      optionsRef.current.trigger && optionsRef.current.trigger.current
        ? optionsRef.current.trigger.current
        : optionsRef.current.trigger

    const tween = gsap.to(el, {
      text: { value: text, delimiter: '' },
      duration: optionsRef.current.duration || 1.2,
      ease: 'none',
      scrollTrigger: triggerEl
        ? { trigger: triggerEl, start: 'top 85%', once: true }
        : null,
      onStart: () => el.classList.add('is-typing'),
      onComplete: () => {
        // Delay removing the cursor slightly for a natural feel
        setTimeout(() => el.classList.remove('is-typing'), 600)
      },
    })

    return () => {
      tween.kill()
      el.classList.remove('is-typing')
    }
  }, [ref, text])
}