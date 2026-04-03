import { computed, reactive } from 'vue'
import { useRoute } from 'vue-router'

const searchTermsByRoute = reactive({})

function resolveRouteSearchKey(route) {
  if (typeof route?.name === 'string' && route.name) {
    return route.name
  }

  return typeof route?.path === 'string' && route.path ? route.path : 'workspace'
}

export function useWorkspacePageSearch() {
  const route = useRoute()
  const routeKey = computed(() => resolveRouteSearchKey(route))

  return computed({
    get() {
      return searchTermsByRoute[routeKey.value] || ''
    },
    set(value) {
      searchTermsByRoute[routeKey.value] = typeof value === 'string' ? value : ''
    },
  })
}
