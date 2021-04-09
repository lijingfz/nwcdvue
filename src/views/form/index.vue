<template>
  <div class="app-container">
    <el-form ref="form" :model="form" label-width="100px">
      <el-form-item label="Case ID">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">Add</el-button>
        <el-button @click="onCancel">Cancel</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { addData } from '@/api/manuallyAddCase'

export default {
  data() {
    return {
      form: {
        name: ''
      }
    }
  },
  methods: {
    onSubmit() {
      var isnum = /^[1]\d{8}[4]$/.test(this.form.name)
      if (isnum) {
        const mydata = { caseid: this.form.name }
        addData(mydata).then((response) => {
          console.log(response)
          this.$alert('数据写入Dynamodb，触发lambda完成添加，请等待1分钟再进行检查！', '注意：', {
            confirmButtonText: '确定',
            callback: action => {
              this.$message({
                message: '手工添加 review case 成功',
                type: 'success'
              })
            }
          })
        })
      } else {
        this.$alert('您确认输入的是正确的 case ID 么？', '注意：', {
          confirmButtonText: '确定',
          callback: action => {
            this.$message.error('请您重新输入正确的case ID')
          }
        })
      }
      this.form.name = ''
    },
    onCancel() {
      this.$message({
        message: 'cancel!',
        type: 'warning'
      })
    }
  }
}
</script>

<style scoped>
.line{
  text-align: center;
}
</style>

