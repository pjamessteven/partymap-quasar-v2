<template>
  <q-card class="privacy-policy-dialog dialog-card fullscreen-mobile-card">
    <q-card-section class="row items-center dialog-card-header">
      <div class="text-h6 inter bolder">{{ $t('about.privacy_policy') }}</div>
      <q-space />
      <q-btn icon="close" flat round dense v-close-popup />
    </q-card-section>

    <q-card-section class="t2 dialog-card-content">
      <u><b>What is this all about?</b></u>
      <p />
      <p>
        Privacy is really important. As the creator of PartyMap I have taken a
        lot of care in regards to how I am handling and storing data. This
        privacy policy formally outlines these concerns and explains what data
        is collected and recorded by PartyMap and how we use it.
      </p>

      <p>
        If you have additional questions or require more information about our
        Privacy Policy, do not hesitate to contact us.
      </p>

      <p>
        This Privacy Policy applies only to our online activities and is valid
        for visitors to our website with regards to the information that they
        shared and/or collect in PartyMap. This policy is not applicable to any
        information collected offline or via channels other than this website.
      </p>

      <u><b>Consent</b></u>
      <p />

      <p>
        I promise that there's nothing nasty in here, but it must be said that
        by using our website, you hereby consent to our Privacy Policy and agree
        to its terms.
      </p>

      <u><b>Information we collect</b></u>
      <p />

      <p>
        The personal information that you are asked to provide, and the reasons
        why you are asked to provide it, will be made clear to you at the point
        we ask you to provide your personal information.
      </p>
      <p>
        If you contact us directly, we may receive additional information about
        you such as your name, email address, phone number, the contents of the
        message and/or attachments you may send us, and any other information
        you may choose to provide.
      </p>
      <p>
        When you register for an Account, we may ask for your contact
        information, including items such as name, company name, address, email
        address, and/or telephone number.
      </p>
      <p>
        When you connect to PartyMap.com, your IP address, browser user-agent
        and rough location is logged. This gives me a rough idea about who is
        actually using this bloody website [laughing crying emoji], where it's
        popping off, and if they're using a phone or desktop.
      </p>

      <u><b>Third-party login disclaimer (Google and FaceBook)</b></u>
      <p />
      <p>
        When you login with your Google or Facebook account, we don't receive
        your login credentials as these are processed by Google or Facebook (the
        authentication provider). We only request the bare-minumum information
        from the authentication provider, which may consist of your full name,
        email address and date of birth. We only store your email address in our
        database, as this is the only personal information we require to create
        a profile.
      </p>
      <p>
        If you delete your PartyMap account, your data (email address) will be
        removed from our database.
      </p>
      <p>
        If you originally logged in with Google or Facebook, but you want to
        move away from it while keeping your PartyMap account, you can add a
        password from the account page and continue to log in with the email
        address affiliated with the third-party login provider and your newly
        created password.
      </p>

      <p>
        NOTE: YOU MUST DO THIS BEFORE DELETING OR DE-ACTIVATING YOUR FACEBOOK OR
        GOOGLE ACCOUNT.
      </p>

      <u><b>How we use your information</b></u>
      <p />

      <p>We use the information we collect in various ways, including to:</p>

      <ul>
        <li>Provide, operate, and maintain our website</li>
        <li>Improve, personalize, and expand our website</li>
        <li>Understand and analyze how you use our website</li>
        <li>Develop new products, services, features, and functionality</li>
        <li>
          Communicate with you, either directly or through one of our partners,
          including for customer service, to provide you with updates and other
          information relating to the website, and for marketing and promotional
          purposes
        </li>
        <li>Send you emails</li>
        <li>Find and prevent fraud</li>
      </ul>

      <u><b>Log Files</b></u>
      <p />

      <p>
        PartyMap follows a standard procedure of using log files. These files
        log visitors when they visit websites. All hosting companies do this and
        a part of hosting services' analytics. The information collected by log
        files include internet protocol (IP) addresses, browser type, Internet
        Service Provider (ISP), date and time stamp, referring/exit pages, and
        possibly the number of clicks. These are not linked to any information
        that is personally identifiable. The purpose of the information is for
        analyzing trends, administering the site, tracking users' movement on
        the website, and gathering demographic information.
      </p>

      <u><b>Cookies and Web Beacons</b></u>
      <p />

      <p>
        Like most websites, PartyMap uses cookies. The only cookie that PartyMap
        stores in your browser is a session token which is used to keep you
        logged into your account. We don't do any creepy tracking.
      </p>

      <u><b>Third Party Privacy Policies</b></u>
      <p />

      <p>
        PartyMap's Privacy Policy does not apply to other advertisers or
        websites. Thus, we are advising you to consult the respective Privacy
        Policies of these third-party ad servers for more detailed information.
        It may include their practices and instructions about how to opt-out of
        certain options.
      </p>

      <p>
        You can choose to disable cookies through your individual browser
        options. To know more detailed information about cookie management with
        specific web browsers, it can be found at the browsers' respective
        websites.
      </p>

      <u><b>CCPA Privacy Rights (Do Not Sell My Personal Information)</b></u>
      <p />

      <p>
        Under the CCPA, among other rights, California consumers have the right
        to:
      </p>
      <ul>
        <li>
          Request that a business that collects a consumer's personal data
          disclose the categories and specific pieces of personal data that a
          business has collected about consumers.
        </li>
        <li>
          Request that a business delete any personal data about the consumer
          that a business has collected.
        </li>
        <li>
          Request that a business that sells a consumer's personal data, not
          sell the consumer's personal data.
        </li>
      </ul>
      <p>
        If you make a request, we have one month to respond to you. If you would
        like to exercise any of these rights, please contact us.
      </p>

      <u><b>GDPR Data Protection Rights</b></u>
      <p />

      <p>
        We would like to make sure you are fully aware of all of your data
        protection rights. Every user is entitled to the following:
      </p>
      <ul>
        <li>
          The right to access – You have the right to request copies of your
          personal data. We may charge you a small fee for this service.
        </li>
        <li>
          The right to rectification – You have the right to request that we
          correct any information you believe is inaccurate. You also have the
          right to request that we complete the information you believe is
          incomplete.
        </li>
        <li>
          The right to erasure – You have the right to request that we erase
          your personal data, under certain conditions.
        </li>
        <li>
          The right to restrict processing – You have the right to request that
          we restrict the processing of your personal data, under certain
          conditions.
        </li>
        <li>
          The right to object to processing – You have the right to object to
          our processing of your personal data, under certain conditions.
        </li>
        <li>
          The right to data portability – You have the right to request that we
          transfer the data that we have collected to another organization, or
          directly to you, under certain conditions.
        </li>
      </ul>

      <p>
        If you make a request, we have one month to respond to you. If you would
        like to exercise any of these rights, please contact us.
      </p>

      <u><b>Children's Information</b></u>
      <p />

      <p>
        Another part of our priority is adding protection for children while
        using the internet. We encourage parents and guardians to observe,
        participate in, and/or monitor and guide their online activity.
      </p>

      <p>
        PartyMap does not knowingly collect any Personal Identifiable
        Information from children under the age of 13. If you think that your
        child provided this kind of information on our website, we strongly
        encourage you to contact us immediately and we will do our best efforts
        to promptly remove such information from our records.
      </p></q-card-section
    >
  </q-card>
</template>

<script>
export default {
  name: 'PrivacyPolicyDialog',
  data() {
    return {};
  },
};
</script>

<style lang="scss">
.privacy-policy-dialog {
  max-height: 660px !important;
  .header {
    position: sticky;
    top: 0;
    z-index: 6;
    width: 100%;
  }
}
</style>
