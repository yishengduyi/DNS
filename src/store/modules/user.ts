import { TOKEN_NAME } from '@/config/global';
import qs from "qs";
import axios from "axios";

import {app} from "@/main"

const InitUserInfo = {
  roles: [],
};

// 定义的state初始值
const state = {
  token: localStorage.getItem(TOKEN_NAME) || 'main_token', // 默认token不走权限
  userInfo: InitUserInfo,
};

const mutations = {
  setToken(state, token) {
    localStorage.setItem(TOKEN_NAME, token);
    state.token = token;
  },
  removeToken(state) {
    localStorage.removeItem(TOKEN_NAME);
    state.token = '';
  },
  setUserInfo(state, userInfo) {
    state.userInfo = userInfo;
  },
};

const getters = {
  token: (state) => state.token,
  roles: (state) => state.userInfo?.roles,
};

const actions = {
  async login({ commit }, userInfo) {
    try {
      const loginData = qs.stringify(userInfo);
      const response = await app.$request.post(
        'login/access-token',
        loginData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      console.log("Response:", response);
      if (response.data.code === 200) {
        commit('setToken', response.data.data.token);
        app.$message.success('登录成功');
        sessionStorage.setItem('isLogin', 'true');
        sessionStorage.setItem('account', userInfo.account);
        sessionStorage.setItem('token', response.data.data.token);
        app.$router.push("/dashboard/base");
      } else {
        app.$message.warning( '验证失败，请输入正确的用户名和密码');
        throw new Error('Login failed');
      }
    } catch (error) {
      console.error(error);
      app.$message.error('登录失败，请稍后再试');
      throw error;
    }
  },
  async getUserInfo({ commit, state }) {
    const mockRemoteUserInfo = async (token) => {
      if (token === 'main_token') {
        return {
          name: 'td_main',
          roles: ['ALL_ROUTERS'],
        };
      }
      return {
        name: 'td_dev',
        roles: ['UserIndex', 'DashboardBase', 'login'],
      };
    };

    const res = await mockRemoteUserInfo(state.token);

    commit('setUserInfo', res);
  },
  async logout({ commit }) {
    commit('removeToken');
    commit('setUserInfo', InitUserInfo);
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
