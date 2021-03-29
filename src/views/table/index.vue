<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.reviewer" placeholder="reviewer" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.owner" placeholder="Case_owner" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <!-- <el-input v-model="listQuery.reviewer" placeholder="Case_Reviewer" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" /> -->
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        Search
      </el-button>
    </div>
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column align="center" label="ID" width="100">
        <template slot-scope="scope">
          {{ scope.row.case_id }}
        </template>
      </el-table-column>
      <el-table-column label="Title">
        <template slot-scope="scope">
          {{ scope.row.case_title }}
          <el-tag>{{ scope.row.id }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="owner" width="110" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.owner }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Level" width="90" align="center">
        <template slot-scope="scope">
          {{ scope.row.support_level }}
        </template>
      </el-table-column>
      <el-table-column label="Reviewer" width="150" align="center">
        <template slot-scope="scope">
          <el-select v-model="scope.row.qa_selection_casecol" placeholder="请选择">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="Actions" width="230" align="right" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button v-show="row.if_assign==='Y'" type="primary" size="mini" @click="handleUpdate(row)">Review</el-button>
          <el-button v-if="row.if_assign==='N'" slot="reference" type="danger" size="mini" @click="submitRowClick(row)"> 提交 </el-button>
          <el-button v-if="row.if_assign==='Y'" slot="reference" type="success" size="mini" @click="submitRowClick(row)"> 提交 </el-button>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        prop="created_at"
        label="Case_selection_time"
        width="200"
      >
        <template slot-scope="scope">
          <i class="el-icon-time" />
          <span>{{ scope.row.selection_date }}</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.rows" @pagination="fetchData" />

    <div class="UpdateDetailCaseResult">
      <el-dialog :title="temp.case_id+' Title: '+mycase_title" :visible.sync="dialogFormVisible">
        <el-tag v-if="sumScore<88" type="danger" effect="dark">{{ sumScore }}</el-tag>
        <el-tag v-if="sumScore>=88" type="success" effect="dark">{{ sumScore }}</el-tag>
        <el-form ref="dataForm" :model="temp" label-position="left" label-width="70px" style="width: 600px; margin-left:50px;">
          <el-form-item label="Review">
            <el-tooltip
              class="item"
              effect="dark"
              content="Correctly understand the “problem description/customer needs” and clarify it if customer doesn't describe it well.
Such as, dev/prod environment, issue frequency, business impact etc."
              placement="top-start"
            >
              <el-button>Measure 1 :</el-button>
            </el-tooltip>
            <el-select v-model="temp.measure1" class="filter-item" placeholder="Please select" @change="temp.measure1!=0?temp.measure1Score=score1:temp.measure1Score=0">
              <el-option v-for="item in checkResult" :key="item.key" :label="item.display_name" :value="item.key" />
            </el-select>
            <el-tag type="warning">{{ temp.measure1Score }}</el-tag>
          </el-form-item>
          <el-form-item label="Review">
            <el-tooltip
              class="item"
              effect="dark"
              content="Right troubleshooting approach:Collect and check appropriate log data/information,  investigation like seaching documents, self study, testing, reproduce, etc."
              placement="top-start"
            >
              <el-button>Measure 2 :</el-button>
            </el-tooltip>
            <el-select v-model="temp.measure2" class="filter-item" placeholder="Please select" @change="temp.measure2!=0?temp.measure2Score=score1:temp.measure2Score=0">
              <el-option v-for="item in checkResult" :key="item.key" :label="item.display_name" :value="item.key" />
            </el-select>
            <el-tag type="warning">{{ temp.measure2Score }}</el-tag>
          </el-form-item>
          <el-form-item label="Review">
            <el-tooltip
              class="item"
              effect="dark"
              content="Record all of your troubleshooting details in WL
Record your investigation for customer‘s log or internal logs include Amazon tool.
Record your finding from self study for internal or public documents.
Record process of thinking, judgment, the key information(troubleshooting steps.)
Record your hypothesis and test plan.
Clearly write down the reproduced steps in the WL.
Record your next action plan. （should be ok if it exists  in SOC）"
              placement="top-start"
            >
              <el-button>Measure 3 :</el-button>
            </el-tooltip>
            <el-select v-model="temp.measure3" class="filter-item" placeholder="Please select" @change="temp.measure3!=0?temp.measure3Score=score2:temp.measure3Score=0">
              <el-option v-for="item in checkResult" :key="item.key" :label="item.display_name" :value="item.key" />
            </el-select>
            <el-tag type="warning">{{ temp.measure3Score }}</el-tag>
          </el-form-item>
          <el-form-item label="Review">
            <el-tooltip
              class="item"
              effect="dark"
              content="Setting correct status on the case. Unassigned, WIP, PMA, MAC, PAA,"
              placement="top-start"
            >
              <el-button>Measure 4 :</el-button>
            </el-tooltip>
            <el-select v-model="temp.measure4" class="filter-item" placeholder="Please select" @change="temp.measure4!=0?temp.measure4Score=score2:temp.measure4Score=0">
              <el-option v-for="item in checkResult" :key="item.key" :label="item.display_name" :value="item.key" />
            </el-select>
            <el-tag type="warning">{{ temp.measure4Score }}</el-tag>
          </el-form-item>
          <el-form-item label="Review">
            <el-tooltip
              class="item"
              effect="dark"
              content="1st SLA:
               - Sev5：Give a quick reply in the 1st response within 15mins , and give meaningful email reply within 0.5h,
               - Sev1：1h (meaningful email reply)
               - Sev2：4h (meaningful email reply)
               - Sev3/Sev4：defined SLA （12h/24h）(meaningful email reply)"
              placement="top-start"
            >
              <el-button>Measure 5 :</el-button>
            </el-tooltip>
            <el-select v-model="temp.measure5" class="filter-item" placeholder="Please select" @change="temp.measure5!=0?temp.measure5Score=score2:temp.measure5Score=0">
              <el-option v-for="item in checkResult" :key="item.key" :label="item.display_name" :value="item.key" />
            </el-select>
            <el-tag type="warning">{{ temp.measure5Score }}</el-tag>
          </el-form-item>
          <el-form-item label="Review">
            <el-tooltip
              class="item"
              effect="dark"
              content="Timely working on MAC cases:
- Check backlog in shift;
- Take priority on high severity cases
Reach an agreement with customer if you can’t meet MAC SLA and keep your promises"
              placement="top-start"
            >
              <el-button>Measure 6 :</el-button>
            </el-tooltip>
            <el-select v-model="temp.measure6" class="filter-item" placeholder="Please select" @change="temp.measure6!=0?temp.measure6Score=score2:temp.measure6Score=0">
              <el-option v-for="item in checkResult" :key="item.key" :label="item.display_name" :value="item.key" />
            </el-select>
            <el-tag type="warning">{{ temp.measure6Score }}</el-tag>
          </el-form-item>
          <el-form-item label="Review">
            <el-tooltip
              class="item"
              effect="dark"
              content="Link or annotate the related case or ticket to the case and describe the relationship of them."
              placement="top-start"
            >
              <el-button>Measure 7 :</el-button>
            </el-tooltip>
            <el-select v-model="temp.measure7" class="filter-item" placeholder="Please select" @change="temp.measure7!=0?temp.measure7Score=score3:temp.measure7Score=0">
              <el-option v-for="item in checkResult" :key="item.key" :label="item.display_name" :value="item.key" />
            </el-select>
            <el-tag type="warning">{{ temp.measure7Score }}</el-tag>
          </el-form-item>
          <el-form-item label="Review">
            <el-tooltip
              class="item"
              effect="dark"
              content="Engage senior engineer,OPS or service team when required
Engage senior engineer, Ops or service team if you have no findings for a long time. Engage Support Ops/service team via formal channel(ZHY SIM or IM)
Track progress with Ops/Service team and record summary in WL after communicating in slack, chime or phone。 Need to push them when required."
              placement="top-start"
            >
              <el-button>Measure 8 :</el-button>
            </el-tooltip>
            <el-select v-model="temp.measure8" class="filter-item" placeholder="Please select" @change="temp.measure8!=0?temp.measure8Score=score2:temp.measure8Score=0">
              <el-option v-for="item in checkResult" :key="item.key" :label="item.display_name" :value="item.key" />
            </el-select>
            <el-tag type="warning">{{ temp.measure8Score }}</el-tag>
          </el-form-item>
          <el-form-item label="Review">
            <el-tooltip
              class="item"
              effect="dark"
              content="Communicate with TAM, PS, CS, BD, PP etc if required and write down the summary in WL (communication via slack, chime or phone call)
Contact TAM for more details if you have something unclear or communicating with customer not fluently.
Work with CS, TAM, BD, SA and MoD if necessary."
              placement="top-start"
            >
              <el-button>Measure 9 :</el-button>
            </el-tooltip>
            <el-select v-model="temp.measure9" class="filter-item" placeholder="Please select" @change="temp.measure9!=0?temp.measure9Score=score2:temp.measure9Score=0">
              <el-option v-for="item in checkResult" :key="item.key" :label="item.display_name" :value="item.key" />
            </el-select>
            <el-tag type="warning">{{ temp.measure9Score }}</el-tag>
          </el-form-item>
          <el-form-item label="Review">
            <el-tooltip
              class="item"
              effect="dark"
              content="Handover to someone else with clear summary in annotation when you are not in shift based on severity/business impact/customer expectation etc"
              placement="top-start"
            >
              <el-button>Measure 10 :</el-button>
            </el-tooltip>
            <el-select v-model="temp.measure10" class="filter-item" placeholder="Please select" @change="temp.measure10!=0?temp.measure10Score=score2:temp.measure10Score=0">
              <el-option v-for="item in checkResult" :key="item.key" :label="item.display_name" :value="item.key" />
            </el-select>
            <el-tag type="warning">{{ temp.measure10Score }}</el-tag>
          </el-form-item>
          <el-form-item label="Review">
            <el-tooltip
              class="item"
              effect="dark"
              content="Sincerely answer all customers questions and provide accurate operational technical advice with logical analysis."
              placement="top-start"
            >
              <el-button>Measure 11 :</el-button>
            </el-tooltip>
            <el-select v-model="temp.measure11" class="filter-item" placeholder="Please select" @change="temp.measure11!=0?temp.measure11Score=score1:temp.measure11Score=0">
              <el-option v-for="item in checkResult" :key="item.key" :label="item.display_name" :value="item.key" />
            </el-select>
            <el-tag type="warning">{{ temp.measure11Score }}</el-tag>
          </el-form-item>
          <el-form-item label="Review">
            <el-tooltip
              class="item"
              effect="dark"
              content="Severity 5/1 email cases, ask for call in 1st response and call customer in subsequence case handling if required."
              placement="top-start"
            >
              <el-button>Measure 12 :</el-button>
            </el-tooltip>
            <el-select v-model="temp.measure12" class="filter-item" placeholder="Please select" @change="temp.measure12!=0?temp.measure12Score=score4:temp.measure12Score=0">
              <el-option v-for="item in checkResult" :key="item.key" :label="item.display_name" :value="item.key" />
            </el-select>
            <el-tag type="warning">{{ temp.measure12Score }}</el-tag>
          </el-form-item>
          <el-form-item label="Review">
            <el-tooltip
              class="item"
              effect="dark"
              content="Set customer s expectation timely like cross account support policy, 3rd party issue,etc"
              placement="top-start"
            >
              <el-button>Measure 13 :</el-button>
            </el-tooltip>
            <el-select v-model="temp.measure13" class="filter-item" placeholder="Please select" @change="temp.measure13!=0?temp.measure13Score=score5:temp.measure13Score=0">
              <el-option v-for="item in checkResult" :key="item.key" :label="item.display_name" :value="item.key" />
            </el-select>
            <el-tag type="warning">{{ temp.measure13Score }}</el-tag>
          </el-form-item>
          <el-form-item label="Review">
            <el-tooltip
              class="item"
              effect="dark"
              content="Need to email reply customer with the summary after discussing technical details or action plans during chat/call."
              placement="top-start"
            >
              <el-button>Measure 14 :</el-button>
            </el-tooltip>
            <el-select v-model="temp.measure14" class="filter-item" placeholder="Please select" @change="temp.measure14!=0?temp.measure14Score=score2:temp.measure14Score=0">
              <el-option v-for="item in checkResult" :key="item.key" :label="item.display_name" :value="item.key" />
            </el-select>
            <el-tag type="warning">{{ temp.measure14Score }}</el-tag>
          </el-form-item>
          <el-form-item label="Review">
            <el-tooltip
              class="item"
              effect="dark"
              content="Explain why you want the customer to provide more information/logs
Reply what you can get from customer’s logs/detail information.
Describe clear steps for gathering the information/logs if required."
              placement="top-start"
            >
              <el-button>Measure 15 :</el-button>
            </el-tooltip>
            <el-select v-model="temp.measure15" class="filter-item" placeholder="Please select" @change="temp.measure15!=0?temp.measure15Score=score2:temp.measure15Score=0">
              <el-option v-for="item in checkResult" :key="item.key" :label="item.display_name" :value="item.key" />
            </el-select>
            <el-tag type="warning">{{ temp.measure15Score }}</el-tag>
          </el-form-item>
          <el-form-item label="Review">
            <el-tooltip
              class="item"
              effect="dark"
              content="Appropriate usage of official documents, terms and abbreviation.  Specify time zone when mentioning date/time in correspondence
Try best to use official document link of China region. (amazonaws.cn)
Need to give well-directed explanation/specification when the document has lots of content.
Properly use standard template (Specific case category)
Handle SYSKA alerts and sensitive info appropriately"
              placement="top-start"
            >
              <el-button>Measure 16 :</el-button>
            </el-tooltip>
            <el-select v-model="temp.measure16" class="filter-item" placeholder="Please select" @change="temp.measure16!=0?temp.measure16Score=score2:temp.measure16Score=0">
              <el-option v-for="item in checkResult" :key="item.key" :label="item.display_name" :value="item.key" />
            </el-select>
            <el-tag type="warning">{{ temp.measure16Score }}</el-tag>
          </el-form-item>
          <el-form-item label="Review">
            <el-tooltip
              class="item"
              effect="dark"
              content="SOC : Record the work timeline, customer pain, correctly describe the status of the case and next steps
Keep it simple for clear state purpose. Avoid put too much detail in SOC. Detail should be in the WL.
Please try to write down customer’s real pain not technical pain.
>>Clarify why customer want to do it."
              placement="top-start"
            >
              <el-button>Measure 17 :</el-button>
            </el-tooltip>
            <el-select v-model="temp.measure17" class="filter-item" placeholder="Please select" @change="temp.measure17!=0?temp.measure17Score=score2:temp.measure17Score=0">
              <el-option v-for="item in checkResult" :key="item.key" :label="item.display_name" :value="item.key" />
            </el-select>
            <el-tag type="warning">{{ temp.measure17Score }}</el-tag>
          </el-form-item>
          <el-form-item label="Review">
            <el-tooltip
              class="item"
              effect="dark"
              content="Big picture understanding ( only for primary profile)
Try to understand customer‘s architecture and environment
Try to check every possible cause for customer issue"
              placement="top-start"
            >
              <el-button>Measure 18 :</el-button>
            </el-tooltip>
            <el-select v-model="temp.measure18" class="filter-item" placeholder="Please select" @change="temp.measure18!=0?temp.measure18Score=score3:temp.measure18Score=0">
              <el-option v-for="item in checkResult" :key="item.key" :label="item.display_name" :value="item.key" />
            </el-select>
            <el-tag type="warning">{{ temp.measure18Score }}</el-tag>
          </el-form-item>
          <el-form-item label="Remark">
            <el-input v-model="temp.remark" :autosize="{ minRows: 2, maxRows: 4}" type="textarea" placeholder="Please input" />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false">
            Cancel
          </el-button>
          <el-button v-show="temp.review_flag ==='N' " type="primary" @click="handleReviewResult()">
            Confirm
          </el-button>
        </div>
      </el-dialog>
    </div>
  </div>

</template>

<script>
import { getList } from '@/api/table'
import { putData } from '@/api/update'
import { putReviewData } from '@/api/updateReview'
import { getCaseMeasure } from '@/api/measure'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

const checkResult = [
  { key: 0, display_name: 'Failed' },
  { key: 1, display_name: 'Passed' },
  { key: 2, display_name: 'Unsuit' }
]

const checkResultKeyValue = checkResult.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  components: { Pagination },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'gray',
        deleted: 'danger'
      }
      return statusMap[status]
    },
    typeFilter(type) {
      return checkResultKeyValue[type]
    }
  },
  data() {
    return {
      list: null,
      responselist: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        rows: 20,
        case_id: undefined,
        owner: undefined,
        reviewer: undefined,
        sort: '+id'
      },
      dialogFormVisible: false,
      // dialogStatus: '',
      dialogStatus: 'update',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      dialogPvVisible: false,
      summitButton: false,
      checkResult,
      mycase_title: undefined,
      mymeasure1: undefined,
      score1: 10,
      score2: 5,
      score3: 3,
      score4: 7,
      score5: 2,
      score6: 0,
      temp: {
        case_id: undefined,
        measure1: 2,
        measure2: 2,
        measure3: 2,
        measure4: 2,
        measure5: 2,
        measure6: 2,
        measure7: 2,
        measure8: 2,
        measure9: 2,
        measure10: 2,
        measure11: 2,
        measure12: 2,
        measure13: 2,
        measure14: 2,
        measure15: 2,
        measure16: 2,
        measure17: 2,
        measure18: 2,
        measure19: 2,
        measure20: 2,
        review_flag: 'N',
        remark: 'Null',
        measure1Score: 10,
        measure2Score: 10,
        measure3Score: 5,
        measure4Score: 5,
        measure5Score: 5,
        measure6Score: 5,
        measure7Score: 3,
        measure8Score: 5,
        measure9Score: 5,
        measure10Score: 5,
        measure11Score: 10,
        measure12Score: 7,
        measure13Score: 2,
        measure14Score: 5,
        measure15Score: 5,
        measure16Score: 5,
        measure17Score: 5,
        measure18Score: 3,
        review_score: 100
      },
      options: [
        {
          value: 'jingamz',
          label: 'jingamz'
        },
        {
          value: 'yanqiao',
          label: 'yanqiao'
        },
        {
          value: 'zhuangzz',
          label: 'zhuangzz'
        },
        {
          value: 'jiangaws',
          label: 'jiangaws'
        },
        {
          value: 'fengaws',
          label: 'fengaws'
        }
      ]
      // value: ''
    }
  },
  computed: {
    sumScore: function() {
      return (this.temp.measure1Score + this.temp.measure2Score + this.temp.measure3Score + this.temp.measure4Score +
      this.temp.measure5Score + this.temp.measure6Score + this.temp.measure7Score + this.temp.measure8Score +
      this.temp.measure9Score + this.temp.measure10Score + this.temp.measure11Score + this.temp.measure12Score +
      this.temp.measure13Score + this.temp.measure14Score + this.temp.measure15Score + this.temp.measure16Score +
      this.temp.measure17Score + this.temp.measure18Score
      )
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      getList(this.listQuery).then((response) => {
        this.list = response.data.list
        this.total = response.data.count
        console.log(response.data.count)
        this.listLoading = false
      })
    },
    fetchMeasure(row) {
      getCaseMeasure(row).then((response) => {
        console.log('jingamz0321!', response.data)
        this.responselist = response.data
        this.temp.case_id = response.data.case_id
        this.temp.measure1 = response.data.measure1
        this.temp.measure2 = response.data.measure2
        this.temp.measure3 = response.data.measure3
        this.temp.measure4 = response.data.measure4
        this.temp.measure5 = response.data.measure5
        this.temp.measure6 = response.data.measure6
        this.temp.measure7 = response.data.measure7
        this.temp.measure8 = response.data.measure8
        this.temp.measure9 = response.data.measure9
        this.temp.measure10 = response.data.measure10
        this.temp.measure11 = response.data.measure11
        this.temp.measure12 = response.data.measure12
        this.temp.measure13 = response.data.measure13
        this.temp.measure14 = response.data.measure14
        this.temp.measure15 = response.data.measure15
        this.temp.measure16 = response.data.measure16
        this.temp.measure17 = response.data.measure17
        this.temp.measure18 = response.data.measure18
        this.temp.review_flag = response.data.review_flag
        this.temp.remark = response.data.review_content
        this.temp.measure1 !== 0 ? this.temp.measure1Score = this.score1 : this.temp.measure1Score = 0
        this.temp.measure2 !== 0 ? this.temp.measure2Score = this.score1 : this.temp.measure2Score = 0
        this.temp.measure3 !== 0 ? this.temp.measure3Score = this.score2 : this.temp.measure3Score = 0
        this.temp.measure4 !== 0 ? this.temp.measure4Score = this.score2 : this.temp.measure4Score = 0
        this.temp.measure5 !== 0 ? this.temp.measure5Score = this.score2 : this.temp.measure5Score = 0
        this.temp.measure6 !== 0 ? this.temp.measure6Score = this.score2 : this.temp.measure6Score = 0
        this.temp.measure7 !== 0 ? this.temp.measure7Score = this.score3 : this.temp.measure7Score = 0
        this.temp.measure8 !== 0 ? this.temp.measure8Score = this.score2 : this.temp.measure8Score = 0
        this.temp.measure9 !== 0 ? this.temp.measure9Score = this.score2 : this.temp.measure9Score = 0
        this.temp.measure10 !== 0 ? this.temp.measure10Score = this.score2 : this.temp.measure10Score = 0
        this.temp.measure11 !== 0 ? this.temp.measure11Score = this.score1 : this.temp.measure11Score = 0
        this.temp.measure12 !== 0 ? this.temp.measure12Score = this.score4 : this.temp.measure12Score = 0
        this.temp.measure13 !== 0 ? this.temp.measure13Score = this.score5 : this.temp.measure13Score = 0
        this.temp.measure14 !== 0 ? this.temp.measure14Score = this.score2 : this.temp.measure14Score = 0
        this.temp.measure15 !== 0 ? this.temp.measure15Score = this.score2 : this.temp.measure15Score = 0
        this.temp.measure16 !== 0 ? this.temp.measure16Score = this.score2 : this.temp.measure16Score = 0
        this.temp.measure17 !== 0 ? this.temp.measure17Score = this.score2 : this.temp.measure17Score = 0
        this.temp.measure18 !== 0 ? this.temp.measure18Score = this.score3 : this.temp.measure18Score = 0
      })
    },
    submitRowClick(row) {
      if (row.qa_selection_casecol) {
        row.if_assign = 'Y'
        console.log(row.qa_selection_casecol, row.case_id)
        const mydata = { case_id: row.case_id, value: row.qa_selection_casecol, if_assign: row.if_assign }
        putData(mydata).then((response) => {
          console.log(response)
          this.$message({
            message: '更新 Reviewer Success',
            type: 'success'
          })
        })
      }
    },
    handleFilter() {
      this.listQuery.page = 1
      this.fetchData()
    },
    handleUpdate(row) {
      // copy obj
      // this.temp.timestamp = new Date(this.temp.timestamp)
      this.dialogStatus = 'update'
      // this.$nextTick(() => {
      //   this.$refs['dataForm'].clearValidate()
      // })
      // this.$nextTick(this.fetchMeasure({ id: row.case_id }))
      this.fetchMeasure({ id: row.case_id })
      // this.temp.measure1 = 2
      this.dialogFormVisible = true
      this.mycase_title = row.case_title
      console.log('Triggered!!', this.mycase_id)
    },
    handleReviewResult() {
      this.temp.review_score = this.sumScore
      this.temp.review_flag = 'Y'
      if (this.temp.remark === null) { this.temp.remark = 'null' }
      console.log('Handle Review result!', this.temp)
      putReviewData(this.temp).then((response) => {
        console.log(response)
        this.$message({
          message: '更新Review结果Success',
          type: 'success'
        })
      })
      this.dialogFormVisible = false
    }
  }
}
</script>
