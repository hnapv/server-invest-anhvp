const PolicyRate = require("../models/PolicyRateModel/PolicyRateModel")
const RateTermPolicy = require("../models/PolicyRateModel/RateTermPolicyModel")

const getListPolicyRate = async()=>{
    const data = await PolicyRate.find()
    return data
}

const createPolicyRate = async (data)=>{
    const insert = await PolicyRate.create(data)
    return insert
}

const insertRateTerm = async (data)=>{
    const insert = await RateTermPolicy.insertMany(data)
    return insert
}

module.exports={
    createPolicyRate,
    insertRateTerm,
    getListPolicyRate
}