<template>
  <router-link :to="{ name: 'ItemHome', params: { slug: data.slug } }" class="item" :class="`item--${type}`">
    <span v-if="type === 'product'" class="indent"></span>
    <span class="item__icon fas fa-fw" :class="`fa-${icon}`"></span>

    <span class="item__name">
      {{ data.name }}
      <i v-if="isMember" v-tooltip="$t('tooltip.isMember')" class="item__user-icon fa fa-user-circle"></i>
    </span>

    <div class="item__kpis">
      <div
        v-tooltip="`${$t('kpi.types.users')}:<br> ${getKpiName('users')}`"
        class="item__kpi"
        :class="{ disabled: getKpiValue('users') === '–––' }"
      >
        <span class="item__kpi-icon fas fa-chart-line"></span>
        <span class="item__kpi-value">{{ getKpiValue('users') }}</span>
        <span class="item__kpi-arrow item__kpi-arrow--up"></span>
      </div>

      <div
        v-tooltip="`${$t('kpi.types.satisfaction')}:<br> ${getKpiName('satisfaction')}`"
        class="item__kpi"
        :class="{ disabled: getKpiValue('satisfaction') === '–––' }"
      >
        <span class="item__kpi-icon far fa-smile"></span>
        <span class="item__kpi-value">{{ getKpiValue('satisfaction') }}</span>
        <span class="item__kpi-arrow item__kpi-arrow--up"></span>
      </div>

      <div
        v-tooltip="`${$t('kpi.types.conversion')}:<br> ${getKpiName('conversion')}`"
        class="item__kpi"
        :class="{ disabled: getKpiValue('conversion') === '–––' }"
      >
        <span class="item__kpi-icon far fa-check-square"></span>
        <span class="item__kpi-value">{{ getKpiValue('conversion') }}</span>
        <span class="item__kpi-arrow item__kpi-arrow--up"></span>
      </div>
    </div>

    <ProgressBar
      v-tooltip="`${Math.round(progression * 100)}%`"
      class="progress-bar"
      :progression="progression"
    ></ProgressBar>

    <span class="item__chevron fas fa-chevron-right"></span>
  </router-link>
</template>

<script>
import { db } from '@/config/firebaseConfig';
import { format } from 'd3';
import { mapState } from 'vuex';

export default {
  name: 'ItemRow',

  components: {
    ProgressBar: () => import('@/components/ProgressBar.vue'),
  },

  props: {
    data: {
      type: Object,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
  },

  data: () => ({
    progression: null,
    kpis: [],
  }),

  computed: {
    ...mapState(['user']),
    isMember() {
      return !!this.data.team && this.data.team.find(({ id }) => id === this.user.id);
    },

    icon() {
      switch (this.type) {
        case 'product':
          return 'cube';
        case 'department':
          return 'cubes';
        case 'organization':
          return 'industry';
        default:
          return '';
      }
    },
  },

  watch: {
    data: {
      immediate: true,
      async handler(data) {
        const ref = db.doc(data.path);
        this.$bind('kpis', db.collection('kpis').where('parent', '==', ref));

        data.onProgressionSnapshot(({ docs }) => {
          if (docs.length) {
            this.progression = docs[0].data().progression;
          }
        });
      },
    },
  },

  methods: {
    getKpiValue(type) {
      try {
        const formatNumber = (() => {
          if (type === 'users') return format('.2s');
          if (type === 'conversion') return format('.2p');
          if (type === 'satisfaction') return format('.2p');
          return format();
        })();
        const kpi = this.kpis.find(obj => obj.type === type);
        if (kpi.error || !kpi.valid) {
          return this.$t('kpi.itemRowError');
        }

        return formatNumber(kpi.currentValue);
      } catch {
        return '–––';
      }
    },
    getKpiName(type) {
      try {
        return this.kpis.find(obj => obj.type === type).name;
      } catch {
        return '';
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles/_colors.scss';

.item {
  display: flex;
  align-items: center;
  margin: 0;
  margin-right: auto;
  padding: 0.5rem span(0, 1);
  color: $color-grey-900;
  text-decoration: none;

  &:hover &__chevron {
    transform: translateX(0);
    opacity: 1;
  }
}

.item__name {
  display: flex;
  flex: 1 1 100%;
  align-items: center;
  margin-right: auto;
  padding-right: 0.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item--department {
  margin-top: 0.5rem;
  font-weight: 500;
  border-top: none;
}

.item--product {
  border-top: 1px solid rgba($color-border, 0.5);
}

.item__icon {
  flex-shrink: 0;
  align-self: flex-start;
  margin-top: 0.15rem;
  margin-right: 0.5rem;
}

.item__chevron {
  color: $color-grey-500;
  transform: translateX(-0.5rem);
  opacity: 0;
  transition: all 0.1s ease-in;
}

.progress-bar {
  flex-shrink: 0;
  width: span(1, 0, span(6)) !important;

  @media screen and (min-width: bp(l)) {
    width: span(2, 0, span(6));
  }
}

.item__kpis {
  display: none;
  margin-right: 1rem;

  @media screen and (min-width: bp(s)) {
    display: flex;
  }
}

.item__kpi {
  display: flex;
  align-items: center;
  padding: 0 0.5rem;
  border-right: 1px solid $color-grey-100;

  &.disabled {
    opacity: 0.4;
  }
}

.item__kpi-value {
  width: 2rem;
  color: #686876;
  font-weight: 500;
  font-size: 0.7rem;
  text-align: right;
}

.item__kpi-icon {
  margin-right: 0.25rem;
  color: $color-purple;
}

.item__user-icon {
  display: inline-block;
  margin-left: auto;
  padding: 0 0.5rem;
  color: $color-purple;
  text-align: center;
}

.indent {
  flex-shrink: 0;
  width: 1.6rem;
}
</style>