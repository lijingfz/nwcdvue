<template>
  <div class="app-container">
    <el-form ref="form" :model="form" label-width="150px">
      <el-form-item label="New Password">
        <el-input v-model="form.password" type="password" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">Change</el-button>
        <el-button @click="onCancel">Cancel</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { changepwd } from '@/api/changePassword'
import { mapGetters } from 'vuex'

export default {
  data() {
    return {
      form: {
        password: ''
      }
    }
  },
  computed: {
    ...mapGetters([
      'name',
      'role',
      'userid',
      'username'
    ])
  },
  methods: {
    onSubmit() {
      var isnum = /^\d{6}$/.test(this.form.password)
      if (isnum) {
        const mydata = { username: this.username, password: this.form.password, name: this.name, role: this.role, id: this.userid }
        changepwd(mydata).then((response) => {
          console.log(response)
          this.$alert('请您确认更改密码', '注意：', {
            confirmButtonText: '确定',
            callback: action => {
              this.$message({
                message: '更改密码成功',
                type: 'success'
              })
            }
          })
        })
      } else {
        this.$alert('请您输入6位数字密码', '注意：', {
          confirmButtonText: '确定',
          callback: action => {
            this.$message.error('密码不符合预设规则')
          }
        })
      }
      this.form.password = ''
    },
    onCancel() {
      this.$message({
        message: 'cancel!',
        type: 'warning'
      })
      this.form.password = ''
    }
  }
}
</script>

<style scoped>
.line{
  text-align: center;
}
</style>
