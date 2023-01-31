import moment from 'moment-timezone'
import NodeGeocoder from 'node-geocoder'
import { i18n } from 'boot/i18n.js'

const weekdays = [
  i18n.t('weekdays.monday'),
  i18n.t('weekdays.tuesday'),
  i18n.t('weekdays.wednesday'),
  i18n.t('weekdays.thursday'),
  i18n.t('weekdays.friday'),
  i18n.t('weekdays.saturday'),
  i18n.t('weekdays.sunday')
]
const months = [
  i18n.t('months.jan'),
  i18n.t('months.feb'),
  i18n.t('months.mar'),
  i18n.t('months.apr'),
  i18n.t('months.may'),
  i18n.t('months.jun'),
  i18n.t('months.jul'),
  i18n.t('months.aug'),
  i18n.t('months.sep'),
  i18n.t('months.oct'),
  i18n.t('months.nov'),
  i18n.t('months.dec')
]
const ordinals = [  
  i18n.t('ordinal_long.1'),
  i18n.t('ordinal_long.2'),
  i18n.t('ordinal_long.3')
]
const ordinalsShort = [
  i18n.t('ordinal_short.1'),
  i18n.t('ordinal_short.2'),
  i18n.t('ordinal_short.3'),
  i18n.t('ordinal_short.4'),
  i18n.t('ordinal_short.5'),
  i18n.t('ordinal_short.6'),
  i18n.t('ordinal_short.7'),
  i18n.t('ordinal_short.8'),
  i18n.t('ordinal_short.9'),
  i18n.t('ordinal_short.10'),
  i18n.t('ordinal_short.11'),
  i18n.t('ordinal_short.12'),
  i18n.t('ordinal_short.13'),
  i18n.t('ordinal_short.14'),
  i18n.t('ordinal_short.15'),
  i18n.t('ordinal_short.16'),
  i18n.t('ordinal_short.17'),
  i18n.t('ordinal_short.18'),
  i18n.t('ordinal_short.19'),
  i18n.t('ordinal_short.20'),
  i18n.t('ordinal_short.21'),
  i18n.t('ordinal_short.22'),
  i18n.t('ordinal_short.23'),
  i18n.t('ordinal_short.24'),
  i18n.t('ordinal_short.25'),
  i18n.t('ordinal_short.26'),
  i18n.t('ordinal_short.27'),
  i18n.t('ordinal_short.28'),
  i18n.t('ordinal_short.29'),
  i18n.t('ordinal_short.30'),
  i18n.t('ordinal_short.31')
]

export const localDayOfMonth = (t, tz) => {
  //moment.locale($t.locale)
  const dayOfMonth = parseInt(moment.tz(t, tz).format('D'))-1
  return ordinalsShort[dayOfMonth]
}

export function getFineLocation() {
  if (navigator.geolocation) {
    this.$store.commit('main/setLoadingLocation', true)
    navigator.geolocation.getCurrentPosition(
      position => {
        this.$store.commit('main/setFineLocation', true)
        this.$store.commit('main/setCurrentLocation', {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
        // Set specific http request headers:
        var HttpsAdapter = require('node-geocoder/lib/httpadapter/httpsadapter.js')
        var httpAdapter = new HttpsAdapter(null, {
          headers: {
            'user-agent': 'PartyMap <info@partymap.com>'
          }
        })
        var geocoder = NodeGeocoder({
          provider: 'openstreetmap',
          httpAdapter: httpAdapter
        })
        geocoder
          .reverse({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          })
          .then(async res => {
            console.log('res', res)
            var location
            if (res[0].neighbourhood && res[0].neighbourhood.length > 0) {
              location = res[0].neighbourhood
            } else if (res[0].city && res[0].city.length > 0) {
              location = res[0].city
            } else {
              location = res[0].state
            }
            if (res[0].country) {
              location = location + ', ' + res[0].country
            }
            this.$store.commit('main/setCurrentLocationName', location)
            this.$store.commit('main/setLoadingLocation', false)
          })
          .catch(() => {
            var unknownCityCoords =
              position.coords.latitude + ', ' + position.coords.longitude
            this.$store.commit('main/setCurrentLocationName', unknownCityCoords)
            this.$store.commit('main/setLoadingLocation', false)
          })
      },
      () => {
        this.$q.notify(this.$t('error_codes.no_location'))
        this.$store.commit('main/setLoadingLocation', false)
      },
      { timeout: 10000 }
    )
  } else {
    this.$store.commit('main/setLoadingLocation', false)
  }
}

export default {
  getMinutesAndSeconds: function (totalSeconds) {
    var minutes = Math.floor(totalSeconds / 60)
    var seconds = totalSeconds - minutes * 60
    return minutes + ':' + seconds
  },
  timeAgo: function (utcDate) {
    // TIMESTAMP STRING MUST END WITH Z
    if (utcDate.indexOf('Z') === -1) {
      utcDate = utcDate + 'Z'
    }
    var timestamp = moment(utcDate).utc()
    timestamp = timestamp.valueOf()
    var locales = {
      prefix: '',
      sufix: 'ago',
      seconds: 'less than a minute',
      minute: 'about a minute',
      minutes: '%d minutes',
      hour: 'about an hour',
      hours: 'about %d hours',
      day: 'a day',
      days: '%d days',
      month: 'about a month',
      months: '%d months',
      year: 'about a year',
      years: '%d years'
    }

    var seconds = Math.floor((new Date() - parseInt(timestamp)) / 1000),
      separator = locales.separator || ' ',
      words = locales.prefix + separator,
      interval = 0,
      intervals = {
        year: seconds / 31536000,
        month: seconds / 2592000,
        day: seconds / 86400,
        hour: seconds / 3600,
        minute: seconds / 60
      }

    var distance = locales.seconds

    for (var key in intervals) {
      interval = Math.floor(intervals[key])

      if (interval > 1) {
        distance = locales[key + 's']
        break
      } else if (interval === 1) {
        distance = locales[key]
        break
      }
    }

    distance = distance.replace(/%d/i, interval)
    words += distance + separator + locales.sufix

    return words.trim()
  },
  // this funciton assumes t1 and t2 are in UTC
  // t2 is an option end date
  relativeHumanTime: function (t1, t2 = null, timezone) {
    var ONE_DAY = 86400000
    var ONE_HOUR = 3600000
    var ONE_MINUTE = 600000

    moment.locale(this.$i18n.locale)
    t1 = moment.tz(t1, timezone).valueOf()

    if (t2) {
      t2 = moment.tz(t2, timezone).valueOf()
    }

    // mins and hours must be chopped off of day measure so we're measuring from the start of each day.
    var t1DateNoTime = moment
      .tz(t1, timezone)
      .hour(0)
      .minute(0)
      .seconds(0)
      .valueOf()

    var now = moment().valueOf()

    var nowDateNoTime = moment
      .tz(timezone)
      .hour(0)
      .minute(0)
      .seconds(0)
      .valueOf()

    var differenceMs = Math.abs(t1 - now)
    var differenceDaysMs = Math.abs(t1DateNoTime - nowDateNoTime)
    var daysDifference = Math.round(differenceDaysMs / ONE_DAY)
    var hoursDifference = Math.round(differenceMs / ONE_HOUR)
    var minutesDifference = Math.round(differenceMs / ONE_MINUTE)
    if (now > t1) {
      if (t2 && now < t2) {
        return this.$t('time.happening_now')
      } else if (daysDifference >= 1) {
        if (daysDifference === 1) {
          return daysDifference + ' ' + this.$t('time.day_ago')
        } else {
          return daysDifference + ' ' + this.$t('time.days_ago')
        }
      } else if (hoursDifference >= 1) {
        if (hoursDifference === 1) {
          return hoursDifference + ' ' + this.$t('time.hour_ago')
        } else {
          return hoursDifference + ' ' + this.$t('time.hours_ago')
        }
      } else {
        if (minutesDifference < 1) {
          return minutesDifference + ' ' + this.$t('time.seconds_ago')
        } else if (minutesDifference === 1) {
          return minutesDifference + ' ' + this.$t('time.min_ago')
        } else {
          return minutesDifference + ' ' + this.$t('time.minutes_ago')
        }
      }
    } else {
      if (daysDifference === 0) {
        return this.$t('time.happening_today')
      } else if (daysDifference === 1) {
        return daysDifference + ' ' + this.$t('time.day_away')
      } else {
        return daysDifference + ' ' + this.$t('time.days_away')
      }
    }
  },
  localDateTimeLong: function (t, tz) {
    moment.locale(this.$i18n.locale)
    var m = moment.tz(t, tz)
    return m.format('dddd') + ', ' + m.format('LLL')
  },
  localDateTimeShort: function (t, tz) {
    moment.locale(this.$i18n.locale)
    var m = moment.tz(t, tz)
    return m.format('dddd') + ', ' + m.format('lll')
  },
  localDateWithWeekday: function (t, tz) {
    moment.locale(this.$i18n.locale)
    var m = moment.tz(t, tz)
    return m.format('ddd') + ' ' + m.format('ll')
  },
  localDateLong: function (t, tz) {
    moment.locale(this.$i18n.locale)
    var m = moment.tz(t, tz)
    return m.format('dddd') + ', ' + moment.tz(t, tz).format('LL')
  },
  localDate: function (t, tz) {
    moment.locale(this.$i18n.locale)
    return moment.tz(t, tz).format('LL')
  },
  localDateISOString: function (t, tz) {
    moment.locale(this.$i18n.locale)
    return moment.tz(t, tz).toISOString()
  },
  localDay: function (t, tz) {
    moment.locale(this.$i18n.locale)
    return moment.tz(t, tz).format('dddd')
  },
  localTimeCompact: function (t, tz) {
    moment.locale(this.$i18n.locale)
    return moment.tz(t, tz).format('LT')
  },
  dateUTCToLocal: function (t) {
    moment.locale(this.$i18n.locale)
    return moment
      .utc(t)
      .local()
      .format('MMMM Do YYYY')
  },
  dateTimeUTCToLocal: function (t) {
    moment.locale(this.$i18n.locale)
    return moment
      .utc(t)
      .local()
      .format('MMMM Do YYYY, h:mm a')
  },
  dateTimeUTCToLocalCompact: function (t) {
    moment.locale(this.$i18n.locale)
    return moment
      .utc(t)
      .local()
      .format('MMMM Do, h:mm a')
  },
  timeZoneAbbreviention: function (t, tz) {
    moment.locale(this.$i18n.locale)
    return moment.tz.zone(tz).abbr(moment(t).valueOf())
  },
  simplifiedRecurringPattern: function (rrule) {
    var ordinals = [
      this.$t('ordinal_long.1'),
      this.$t('ordinal_long.2'),
      this.$t('ordinal_long.3')
    ]

    if (rrule === null) {
      return null
    } else if (rrule.recurring_type === 1) {
      // weekly recurring
      if (rrule.separation_count === 1) {
        return this.$t('time.every') + ' ' + this.$t('time.week')
      } else {
        // include separation count
        return (
          this.$t('time.every') +
          ' ' +
          ordinals[rrule.separation_count - 1] +
          ' ' +
          this.$t('time.week')
        )
      }
    } else if (rrule.recurring_type === 2) {
      // monthly recurring
      // relative recurrence
      if (rrule.separation_count === 1) {
        return this.$t('time.every') + ' ' + this.$t('time.month')
      } else {
        // include separation count
        return (
          this.$t('time.every') +
          ' ' +
          ordinals[rrule.separation_count - 1] +
          ' ' +
          this.$t('time.month')
        )
      }
    } else if (rrule.recurring_type === 3) {
      // relative recurrence
      if (rrule.separation_count === 1) {
        return this.$t('time.every_year')
      } else {
        // include separation count
        return (
          this.$t('time.every') +
          ' ' +
          ordinals[rrule.separation_count - 1] +
          ' ' +
          this.$t('time.year')
        )
      }
    } else {
      return ''
    }
  },
  recurringPattern: function (rrule) {

    if (rrule === null) {
      return null
    } else if (rrule.recurring_type === 1) {
      // weekly recurring
      if (rrule.separation_count === 1) {
        return this.$t('time.every') + ' ' + weekdays[rrule.day_of_week - 1]
      } else {
        // include separation count
        return (
          this.$t('time.every') +
          ' ' +
          ordinals[rrule.separation_count - 1] +
          ' ' +
          weekdays[rrule.day_of_week - 1]
        )
      }
    } else if (rrule.recurring_type === 2) {
      // monthly recurring
      if (rrule.week_of_month) {
        // relative recurrence
        if (rrule.separation_count === 1) {
          return (
            this.$t('time.every') +
            ' ' +
            ordinals[rrule.week_of_month - 1] +
            ' ' +
            weekdays[rrule.day_of_week - 1] +
            ' ' +
            this.$t('time.of_the_month')
          )
        } else {
          // include separation count
          return (
            this.$t('time.every') +
            ' ' +
            ordinals[rrule.week_of_month - 1] +
            ' ' +
            weekdays[rrule.day_of_week - 1] +
            ' ' +
            this.$t('time.of_every') +
            ' ' +
            ordinals[rrule.separation_count - 1] +
            ' ' +
            this.$t('time.month')
          )
        }
      } else {
        // absoulte recurrance
        if (rrule.separation_count === 1) {
          return (
            this.$t('time.every') +
            ' ' +
            ordinalsShort[rrule.day_of_month - 1] +
            ' ' +
            this.$t('time.day_of_the_month')
          )
        } else {
          // include separation count
          return (
            this.$t('time.every') +
            ' ' +
            ordinalsShort[rrule.day_of_month - 1] +
            ' ' +
            this.$t('time.of_every') +
            ' ' +
            ordinals[rrule.separation_count - 1] +
            this.$t('time.month')
          )
        }
      }
    } else if (rrule.recurring_type === 3) {
      // annual
      if (rrule.week_of_month) {
        // relative recurrence
        if (rrule.separation_count === 1) {
          return (
            this.$t('time.every_year') +
            ' ' +
            this.$t('time.on_the') +
            ' ' +
            ordinals[rrule.week_of_month - 1] +
            ' ' +
            weekdays[rrule.day_of_week - 1] +
            ' ' +
            this.$t('time.of') +
            ' ' +
            months[rrule.month_of_year - 1]
          )
        } else {
          // include separation count
          return (
            this.$t('time.every') +
            ' ' +
            rrule.separation_count +
            ' ' +
            this.$t('time.years') +
            ' ' +
            this.$t('time.on_the') +
            ' ' +
            ordinals[rrule.week_of_month - 1] +
            ' ' +
            weekdays[rrule.day_of_week - 1] +
            ' ' +
            this.$t('time.of') +
            ' ' +
            months[rrule.month_of_year - 1]
          )
        }
      } else {
        if (rrule.separation_count === 1) {
          return (
            this.$t('time.every_year') +
            ' ' +
            this.$t('time.on_the') +
            ' ' +
            ordinalsShort[rrule.day_of_month - 1] +
            ' ' +
            this.$t('time.of') +
            ' ' +
            months[rrule.month_of_year - 1]
          )
        } else {
          // include separation count
          return (
            this.$t('time.every') +
            ' ' +
            rrule.separation_count +
            ' ' +
            this.$t('time.years') +
            ' ' +
            this.$t('time.on_the') +
            ' ' +
            ordinalsShort[rrule.day_of_month - 1] +
            ' ' +
            this.$t('time.of') +
            ' ' +
            months[rrule.month_of_year - 1]
          )
        }
      }
    } else {
      return ''
    }
  },
  recurringPatternKebab: function (rrule) {
    
    if (rrule.recurringType === 1) {
      // weekly recurring
      if (rrule.separationCount === 1) {
        return this.$t('time.every') + ' ' + weekdays[rrule.dayOfWeek - 1]
      } else {
        // include separation count
        return (
          this.$t('time.every') +
          ' ' +
          ordinals[rrule.separationCount - 1] +
          ' ' +
          weekdays[rrule.dayOfWeek - 1]
        )
      }
    } else if (rrule.recurringType === 2) {
      // monthly recurring
      if (rrule.weekOfMonth) {
        // relative recurrence
        if (rrule.separationCount === 1) {
          return (
            this.$t('time.every') +
            ' ' +
            ordinals[rrule.weekOfMonth - 1] +
            ' ' +
            weekdays[rrule.dayOfWeek - 1] +
            ' ' +
            this.$t('time.of_the_month')
          )
        } else {
          // include separation count
          return (
            this.$t('time.every') +
            ' ' +
            ordinals[rrule.weekOfMonth - 1] +
            ' ' +
            weekdays[rrule.dayOfWeek - 1] +
            ' ' +
            this.$t('time.of_every') +
            ' ' +
            ordinals[rrule.separationCount - 1] +
            ' ' +
            this.$t('time.month')
          )
        }
      } else {
        // absoulte recurrance
        if (rrule.separationCount === 1) {
          return (
            this.$t('time.every') +
            ' ' +
            ordinalsShort[rrule.dayOfMonth - 1] +
            ' ' +
            this.$t('time.day_of_the_month')
          )
        } else {
          // include separation count
          return (
            this.$t('time.every') +
            ' ' +
            ordinalsShort[rrule.dayOfMonth - 1] +
            ' ' +
            this.$t('time.of_every') +
            ' ' +
            ordinals[rrule.separationCount - 1] +
            this.$t('time.month')
          )
        }
      }
    } else if (rrule.recurring_type === 3) {
      // annual
      if (rrule.weekOfMonth) {
        // relative recurrence
        if (rrule.separationCount === 1) {
          return (
            this.$t('time.every_year') +
            ' ' +
            this.$t('time.on_the') +
            ' ' +
            ordinals[rrule.weekOfMonth - 1] +
            ' ' +
            weekdays[rrule.dayOfWeek - 1] +
            ' ' +
            this.$t('time.of') +
            ' ' +
            months[rrule.monthOfYear - 1]
          )
        } else {
          // include separation count
          return (
            this.$t('time.every') +
            ' ' +
            rrule.separationCount +
            ' ' +
            this.$t('time.years') +
            ' ' +
            this.$t('time.on_the') +
            ' ' +
            ordinals[rrule.weekOfMonth - 1] +
            ' ' +
            weekdays[rrule.dayOfWeek - 1] +
            ' ' +
            this.$t('time.of') +
            ' ' +
            months[rrule.monthOfYear - 1]
          )
        }
      } else {
        if (rrule.separationCount === 1) {
          return (
            this.$t('time.every_year') +
            ' ' +
            this.$t('time.on_the') +
            ' ' +
            ordinalsShort[rrule.dayOfMonth - 1] +
            ' ' +
            this.$t('time.of') +
            ' ' +
            months[rrule.monthOfYear - 1]
          )
        } else {
          // include separation count
          return (
            this.$t('time.every') +
            ' ' +
            rrule.separationCount +
            ' ' +
            this.$t('time.years') +
            ' ' +
            this.$t('time.on_the') +
            ' ' +
            ordinalsShort[rrule.dayOfWeek - 1] +
            ' ' +
            this.$t('time.of') +
            ' ' +
            months[rrule.monthOfYear - 1]
          )
        }
      }
    } else {
      return ''
    }
  }
}