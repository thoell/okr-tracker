<template>
  <div>
    <ul v-if="user" class="items">
      <li v-for="org in tree" :key="org.id">
        <ItemRow :data="org" type="organization"></ItemRow>
        <ul>
          <li v-for="dept in org.children" :key="dept.id" class="card">
            <itemRow :data="dept" type="department"></itemRow>
            <ul>
              <li v-for="prod in dept.children" :key="prod.id">
                <itemRow :data="prod" type="product"></itemRow>
              </li>
            </ul>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

export default {
  name: 'Home',

  components: {
    ItemRow: () => import('@/components/ItemRow.vue'),
  },

  computed: {
    ...mapGetters(['tree']),
    ...mapState(['user']),
  },
};
</script>

<style lang="scss" scoped>
.items {
  width: span(12);
  margin-top: 0.5rem;

  @media screen and (min-width: bp(m)) {
    width: span(9, 0, span(9));
    margin-top: 1rem;
  }

  @media screen and (min-width: bp(l)) {
    width: span(8, 0, span(10));
  }

  @media screen and (min-width: bp(xl)) {
    margin-top: 1.5rem;
  }
}

.card {
  background: white;
  border-radius: 2px;
  box-shadow: 0 0.15rem 0.15rem rgba(black, 0.07);

  @media screen and (min-width: bp(l)) {
    margin-bottom: 1rem;
  }
}
</style>
