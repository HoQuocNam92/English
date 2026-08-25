/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(auth)/login` | `/(auth)/register` | `/(onboarding)/career-goal` | `/(onboarding)/certificate` | `/(onboarding)/it-field` | `/(onboarding)/level` | `/(tabs)` | `/(tabs)/home` | `/(tabs)/learning` | `/(tabs)/practice` | `/(tabs)/profile` | `/(tabs)/progress` | `/..\..\web\.next\types\app\(auth)\login\page` | `/..\..\web\.next\types\app\(dashboard)\certifications\page` | `/..\..\web\.next\types\app\(dashboard)\dashboard\page` | `/..\..\web\.next\types\app\(dashboard)\layout` | `/..\..\web\.next\types\app\(dashboard)\learning-content\page` | `/..\..\web\.next\types\app\(dashboard)\lessons\page` | `/..\..\web\.next\types\app\(dashboard)\levels\page` | `/..\..\web\.next\types\app\(dashboard)\students\page` | `/..\..\web\.next\types\app\(dashboard)\users\page` | `/..\..\web\.next\types\app\(learner)\learn\flashcards\[id]\page` | `/..\..\web\.next\types\app\(learner)\learn\lessons\page` | `/..\..\web\.next\types\app\(learner)\learn\page` | `/..\..\web\.next\types\app\(learner)\learn\practice\page` | `/..\..\web\.next\types\app\(learner)\learn\progress\page` | `/..\..\web\.next\types\app\layout` | `/..\..\web\.next\types\app\page` | `/..\..\web\.next\types\validator` | `/_sitemap` | `/career-goal` | `/certificate` | `/home` | `/it-field` | `/learning` | `/lessons` | `/level` | `/login` | `/practice` | `/profile` | `/profile/change-password` | `/profile/edit` | `/progress` | `/register` | `/test-history`;
      DynamicRoutes: `/answer-review/${Router.SingleRoutePart<T>}` | `/lessons/${Router.SingleRoutePart<T>}` | `/lessons/vocabulary/${Router.SingleRoutePart<T>}` | `/quiz/${Router.SingleRoutePart<T>}` | `/scenario/${Router.SingleRoutePart<T>}` | `/test-result/${Router.SingleRoutePart<T>}`;
      DynamicRouteTemplate: `/answer-review/[id]` | `/lessons/[id]` | `/lessons/vocabulary/[id]` | `/quiz/[id]` | `/scenario/[id]` | `/test-result/[id]`;
    }
  }
}
