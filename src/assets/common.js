import moment from 'moment-timezone';
import { i18n } from 'src/boot/i18n.ts';

const { t } = i18n.global;
const locale = 'en';

const weekdays = [
  t('weekdays.monday'),
  t('weekdays.tuesday'),
  t('weekdays.wednesday'),
  t('weekdays.thursday'),
  t('weekdays.friday'),
  t('weekdays.saturday'),
  t('weekdays.sunday'),
];
const months = [
  t('months.jan'),
  t('months.feb'),
  t('months.mar'),
  t('months.apr'),
  t('months.may'),
  t('months.jun'),
  t('months.jul'),
  t('months.aug'),
  t('months.sep'),
  t('months.oct'),
  t('months.nov'),
  t('months.dec'),
];
const ordinals = [
  t('ordinal_long.1'),
  t('ordinal_long.2'),
  t('ordinal_long.3'),
];
const ordinalsShort = [
  t('ordinal_short.1'),
  t('ordinal_short.2'),
  t('ordinal_short.3'),
  t('ordinal_short.4'),
  t('ordinal_short.5'),
  t('ordinal_short.6'),
  t('ordinal_short.7'),
  t('ordinal_short.8'),
  t('ordinal_short.9'),
  t('ordinal_short.10'),
  t('ordinal_short.11'),
  t('ordinal_short.12'),
  t('ordinal_short.13'),
  t('ordinal_short.14'),
  t('ordinal_short.15'),
  t('ordinal_short.16'),
  t('ordinal_short.17'),
  t('ordinal_short.18'),
  t('ordinal_short.19'),
  t('ordinal_short.20'),
  t('ordinal_short.21'),
  t('ordinal_short.22'),
  t('ordinal_short.23'),
  t('ordinal_short.24'),
  t('ordinal_short.25'),
  t('ordinal_short.26'),
  t('ordinal_short.27'),
  t('ordinal_short.28'),
  t('ordinal_short.29'),
  t('ordinal_short.30'),
  t('ordinal_short.31'),
];

export const localDayOfMonth = (t, tz) => {
  //moment.locale($t.locale)
  const dayOfMonth = parseInt(moment.tz(t, tz).format('D')) - 1;
  return ordinalsShort[dayOfMonth];
};

export default {
  getMinutesAndSeconds: function (totalSeconds) {
    var minutes = Math.floor(totalSeconds / 60);
    var seconds = totalSeconds - minutes * 60;
    return minutes + ':' + seconds;
  },
  timeAgo: function (utcDate) {
    // TIMESTAMP STRING MUST END WITH Z
    if (utcDate.indexOf('Z') === -1) {
      utcDate = utcDate + 'Z';
    }
    var timestamp = moment(utcDate).utc();
    timestamp = timestamp.valueOf();
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
      years: '%d years',
    };

    var seconds = Math.floor((new Date() - parseInt(timestamp)) / 1000),
      separator = locales.separator || ' ',
      words = locales.prefix + separator,
      interval = 0,
      intervals = {
        year: seconds / 31536000,
        month: seconds / 2592000,
        day: seconds / 86400,
        hour: seconds / 3600,
        minute: seconds / 60,
      };

    var distance = locales.seconds;

    for (var key in intervals) {
      interval = Math.floor(intervals[key]);

      if (interval > 1) {
        distance = locales[key + 's'];
        break;
      } else if (interval === 1) {
        distance = locales[key];
        break;
      }
    }

    distance = distance.replace(/%d/i, interval);
    words += distance + separator + locales.sufix;

    return words.trim();
  },
  // this funciton assumes t1 and t2 are in UTC
  // t2 is an option end date
  relativeHumanTime: function (t1, t2 = null, timezone) {
    const ONE_MINUTE = 600000;
    const ONE_HOUR = ONE_MINUTE * 60;
    const ONE_DAY = ONE_HOUR * 24;
    const ONE_WEEK = ONE_DAY * 7;
    const ONE_MONTH = ONE_WEEK * 4.35;

    moment.locale(locale);
    t1 = moment.tz(t1, timezone).valueOf();

    if (t2) {
      t2 = moment.tz(t2, timezone).valueOf();
    }

    // mins and hours must be chopped off of day measure so we're measuring from the start of each day.
    const t1DateNoTime = moment
      .tz(t1, timezone)
      .hour(0)
      .minute(0)
      .seconds(0)
      .valueOf();

    const now = moment().valueOf();

    const nowDateNoTime = moment
      .tz(timezone)
      .hour(0)
      .minute(0)
      .seconds(0)
      .valueOf();

    const differenceMs = Math.abs(t1 - now);
    const differenceDaysMs = Math.abs(t1DateNoTime - nowDateNoTime);

    const monthsDifference = Math.floor(
      differenceDaysMs / 1000 / 60 / (60 * 24 * 7 * 4)
    );

    const weeksDifference = Math.floor(
      differenceDaysMs / 1000 / 60 / (60 * 24 * 7)
    );
    const daysDifference = Math.floor(differenceDaysMs / 1000 / 60 / (60 * 24));
    const hoursDifference = Math.round(differenceMs / ONE_HOUR);
    const minutesDifference = Math.round(differenceMs / ONE_MINUTE);

    if (now > t1) {
      if (t2 && now < t2) {
        return this.$t('time.happening_now');
      } else if (monthsDifference >= 1) {
        if (monthsDifference === 1) {
          return monthsDifference + ' ' + this.$t('time.month_ago');
        } else {
          return monthsDifference + ' ' + this.$t('time.months_ago');
        }
      } else if (weeksDifference >= 1) {
        if (weeksDifference === 1) {
          return weeksDifference + ' ' + this.$t('time.week_ago');
        } else {
          return weeksDifference + ' ' + this.$t('time.weeks_ago');
        }
      } else if (daysDifference >= 1) {
        if (daysDifference === 1) {
          return daysDifference + ' ' + this.$t('time.day_ago');
        } else {
          return daysDifference + ' ' + this.$t('time.days_ago');
        }
      } else if (hoursDifference >= 1) {
        if (hoursDifference === 1) {
          return hoursDifference + ' ' + this.$t('time.hour_ago');
        } else {
          return hoursDifference + ' ' + this.$t('time.hours_ago');
        }
      } else {
        if (minutesDifference < 1) {
          return minutesDifference + ' ' + this.$t('time.seconds_ago');
        } else if (minutesDifference === 1) {
          return minutesDifference + ' ' + this.$t('time.minute_ago');
        } else {
          return minutesDifference + ' ' + this.$t('time.minutes_ago');
        }
      }
    } else {
      if (daysDifference === 0) {
        return this.$t('time.happening_today');
      } else if (monthsDifference >= 1) {
        if (monthsDifference === 1) {
          return monthsDifference + ' ' + this.$t('time.month_away');
        } else {
          return monthsDifference + ' ' + this.$t('time.months_away');
        }
      } else if (weeksDifference >= 1) {
        if (weeksDifference === 1) {
          return weeksDifference + ' ' + this.$t('time.week_away');
        } else {
          return weeksDifference + ' ' + this.$t('time.weeks_away');
        }
      } else if (daysDifference === 1) {
        return daysDifference + ' ' + this.$t('time.day_away');
      } else {
        return daysDifference + ' ' + this.$t('time.days_away');
      }
    }
  },
  localDateTimeLong: function (t, tz) {
    moment.locale(locale);
    var m = moment.tz(t, tz);
    return m.format('dddd') + ', ' + m.format('LLL');
  },
  localDateTimeShort: function (t, tz) {
    moment.locale(locale);
    var m = moment.tz(t, tz);
    return m.format('ddd') + ' ' + m.format('lll');
  },
  month: function (t, tz) {
    moment.locale(locale);
    var m = moment.tz(t, tz);
    return m.format('MMMM');
  },
  monthYear: function (t, tz) {
    moment.locale(locale);
    var m = moment.tz(t, tz);
    return m.format('MMMM') + ' ' + m.format('YYYY');
  },
  localDateWithWeekday: function (t, tz) {
    moment.locale(locale);
    var m = moment.tz(t, tz);
    return m.format('ddd') + ' ' + m.format('ll');
  },
  localDateLong: function (t, tz) {
    moment.locale(locale);
    var m = moment.tz(t, tz);
    return m.format('dddd') + ', ' + moment.tz(t, tz).format('LL');
  },
  localDate: function (t, tz) {
    moment.locale(locale);
    return moment.tz(t, tz).format('LL');
  },
  localDateISOString: function (t, tz) {
    moment.locale(locale);
    return moment.tz(t, tz).toISOString();
  },
  localDay: function (t, tz) {
    moment.locale(locale);
    return moment.tz(t, tz).format('dddd');
  },
  localTimeCompact: function (t, tz) {
    moment.locale(locale);
    return moment.tz(t, tz).format('LT');
  },
  dateUTCToLocal: function (t) {
    moment.locale(locale);
    return moment.utc(t).local().format('MMMM Do YYYY');
  },
  dateTimeUTCToLocal: function (t) {
    moment.locale(locale);
    return moment.utc(t).local().format('MMMM Do YYYY, h:mm a');
  },
  dateTimeUTCToLocalCompact: function (t) {
    moment.locale(locale);
    return moment.utc(t).local().format('MMMM Do, h:mm a');
  },
  timeZoneAbbreviention: function (t, tz) {
    moment.locale(locale);
    return moment.tz.zone(tz).abbr(moment(t).valueOf());
  },
  simplifiedRecurringPattern: function (rrule) {
    var ordinals = [
      this.$t('ordinal_long.1'),
      this.$t('ordinal_long.2'),
      this.$t('ordinal_long.3'),
    ];

    if (rrule === null) {
      return null;
    } else if (rrule.recurring_type === 1) {
      // weekly recurring
      if (rrule.separation_count === 1) {
        return this.$t('time.every') + ' ' + this.$t('time.week');
      } else {
        // include separation count
        return (
          this.$t('time.every') +
          ' ' +
          ordinals[rrule.separation_count - 1] +
          ' ' +
          this.$t('time.week')
        );
      }
    } else if (rrule.recurring_type === 2) {
      // monthly recurring
      // relative recurrence
      if (rrule.separation_count === 1) {
        return this.$t('time.every') + ' ' + this.$t('time.month');
      } else {
        // include separation count
        return (
          this.$t('time.every') +
          ' ' +
          ordinals[rrule.separation_count - 1] +
          ' ' +
          this.$t('time.month')
        );
      }
    } else if (rrule.recurring_type === 3) {
      // relative recurrence
      if (rrule.separation_count === 1) {
        return this.$t('time.every_year');
      } else {
        // include separation count
        return (
          this.$t('time.every') +
          ' ' +
          ordinals[rrule.separation_count - 1] +
          ' ' +
          this.$t('time.year')
        );
      }
    } else {
      return '';
    }
  },
  recurringPattern: function (rrule) {
    if (rrule === null) {
      return null;
    } else if (rrule.recurring_type === 1) {
      // weekly recurring
      if (rrule.separation_count === 1) {
        return this.$t('time.every') + ' ' + weekdays[rrule.day_of_week - 1];
      } else {
        // include separation count
        return (
          this.$t('time.every') +
          ' ' +
          ordinals[rrule.separation_count - 1] +
          ' ' +
          weekdays[rrule.day_of_week - 1]
        );
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
          );
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
          );
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
          );
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
          );
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
          );
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
          );
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
          );
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
          );
        }
      }
    } else {
      return '';
    }
  },
  recurringPatternKebab: function (rrule) {
    if (rrule.recurringType === 1) {
      // weekly recurring
      if (rrule.separationCount === 1) {
        return this.$t('time.every') + ' ' + weekdays[rrule.dayOfWeek - 1];
      } else {
        // include separation count
        return (
          this.$t('time.every') +
          ' ' +
          ordinals[rrule.separationCount - 1] +
          ' ' +
          weekdays[rrule.dayOfWeek - 1]
        );
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
          );
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
          );
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
          );
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
          );
        }
      }
    } else if (rrule.recurringType === 3) {
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
          );
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
          );
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
          );
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
          );
        }
      }
    } else {
      return '';
    }
  },
};
