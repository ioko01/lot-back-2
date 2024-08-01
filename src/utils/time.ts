export function GMT(gmt?: number): Date;
export function GMT(): Date {
    const date = new Date()

    let day = date.getDate().toString()
    let month = (date.getMonth() + 1).toString()
    let year = date.getFullYear().toString()
    let hour = date.getHours().toString()
    let min = date.getMinutes().toString()
    let sec = date.getSeconds().toString()


    if (parseInt(month) < 10) month = `0${month}`
    if (parseInt(day) < 10) day = `0${day}`

    if (parseInt(hour) < 10) hour = `0${hour}`
    if (parseInt(min) < 10) min = `0${min}`
    if (parseInt(sec) < 10) sec = `0${sec}`

    const this_date = new Date(`${year}-${month}-${day}T${hour}:${min}:${sec}`)
    return this_date
    // return new Date(Date.now() + 1000 * 60 * 60 * number);
}

export const getTomorrow = (t1: string, t2: string) => {
    //check เวลาปิดน้อยกว่าหรือเท่ากับเวลาเปิด ถ้าน้อยกว่า จะเท่ากับงวด พรุ่งนี้
    if (parseInt(t2.split(":")[0]) <= parseInt(t1.split(":")[0])) {
        // ถ้าเวลาปิด == เวลาเปิด
        if (parseInt(t2.split(":")[0]) == parseInt(t1.split(":")[0])) {
            // ให้เช็ค นาที ปิด น้อยกว่า นาทีเปิด
            if (parseInt(t2.split(":")[1]) < parseInt(t1.split(":")[1])) return true
            return false
        }
        return true
    }
    return false
}

export const getYesterday = (t1: string, t2: string) => {
    //check เวลาปัจจุบันมากกว่าหรือเท่ากับเวลาเปิด ถ้ามากกว่า จะเท่ากับงวด พรุ่งนี้
    if (parseInt(t2.split(":")[0]) >= parseInt(t1.split(":")[0])) {
        // ถ้าเวลาปิด == เวลาเปิด
        if (parseInt(t2.split(":")[0]) == parseInt(t1.split(":")[0])) {
            // ให้เช็ค นาที ปิด น้อยกว่า นาทีเปิด
            if (parseInt(t2.split(":")[1]) > parseInt(t1.split(":")[1])) return true
            return false
        }
        return true
    }
    return false
}