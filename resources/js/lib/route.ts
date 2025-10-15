import routeFn from 'ziggy-js'
import { Ziggy } from '@/ziggy'

export const route = (name: string, params?: any, absolute?: boolean) =>
    routeFn(name, params, absolute, Ziggy)

export default route
