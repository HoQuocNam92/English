/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(auth)/login` | `/(auth)/register` | `/(onboarding)/career-goal` | `/(onboarding)/certificate` | `/(onboarding)/it-field` | `/(onboarding)/level` | `/(tabs)` | `/(tabs)/home` | `/(tabs)/learning` | `/(tabs)/practice` | `/(tabs)/profile` | `/(tabs)/progress` | `/_sitemap` | `/career-goal` | `/certificate` | `/home` | `/it-field` | `/learning` | `/lessons` | `/level` | `/login` | `/practice` | `/profile` | `/profile/change-password` | `/profile/edit` | `/progress` | `/register` | `/test-history`;
      DynamicRoutes: `/answer-review/${Router.SingleRoutePart<T>}` | `/lessons/${Router.SingleRoutePart<T>}` | `/lessons/vocabulary/${Router.SingleRoutePart<T>}` | `/quiz/${Router.SingleRoutePart<T>}` | `/scenario/${Router.SingleRoutePart<T>}` | `/test-result/${Router.SingleRoutePart<T>}`;
      DynamicRouteTemplate: `/answer-review/[id]` | `/lessons/[id]` | `/lessons/vocabulary/[id]` | `/quiz/[id]` | `/scenario/[id]` | `/test-result/[id]`;
    }
  }
}
