import range from 'lodash/range';
import React, { useState } from 'react';
import { doPost } from '../lib/apiUtil';
import { redirect } from '../lib/util/browserUtil';
import { useCurrentUser } from "../lib/useCurrentUser";
import { useJssStyles } from "../lib/useJssStyles";
import { formatTimeInHours, getUserOptions, UserOptions } from '../lib/userOptions';
import { getTimezonesList } from '../lib/util/timeUtil';
import { Checkbox, ErrorMessage, Link, TextInput } from "./widgets";


export function UserConfiguration() {
  const classes = useJssStyles("UserConfiguration", () => ({
    twoColumnSetting: {
      marginBottom: 6,
    },
    label: {
      display: "inline-block",
      width: 200,
    },
    optionColumn: {
      display: "inline-block",
    },
    checkboxSetting: {
      marginBottom: 6,
    },
    select: {
      width: 230,
    },
  }));
  
  const user = useCurrentUser()!;
  const [currentOptions,setCurrentOptions] = useState(getUserOptions(user));
  const [showChangePassword,setShowChangePassword] = useState(false);
  const timezones = getTimezonesList();
  
  async function updateOptions(options: Partial<UserOptions>) {
    const mergedOptions = {...currentOptions, ...options};
    setCurrentOptions(mergedOptions);
    
    const {result:_r, error:_e} = await doPost<ApiTypes.ApiChangeUserConfig>({
      endpoint: "/api/users/changeConfig",
      query: {},
      body: { config: options },
    });
  }
  
  return <div>
    <Checkbox
      label="Email once per day to remind me if I have cards due"
      className={classes.checkboxSetting}
      value={currentOptions.enableCardsDueEmails}
      setValue={checked => updateOptions({ enableCardsDueEmails: checked })}
    />

    <div className={classes.twoColumnSetting}>
      <div className={classes.label}>
        My time zone
      </div>
      <div className={classes.optionColumn}>
        <select
          className={classes.select}
          value={currentOptions.timezone}
          onChange={ev => updateOptions({
            timezone: ev.target.value
          })}
        >
          {timezones.map(tz =>
            <option
              key={tz.abbrev}
            >
              {`${tz.offsetStr} (${tz.name})`}
            </option>
          )};
        </select>
      </div>
    </div>
    <div className={classes.twoColumnSetting}>
      <div className={classes.label}>
        Cards become due at
      </div>
      <div className={classes.optionColumn}>
        <select
          className={classes.select}
          value={currentOptions.cardsBecomeDueAt}
          onChange={ev => updateOptions({
            cardsBecomeDueAt: parseFloat(ev.target.value)
          })}
        >
          {range(0,24).map(hour => <React.Fragment key={hour}>
            <option value={hour}>{formatTimeInHours(hour)}</option>
            <option value={hour+0.5}>{formatTimeInHours(hour+0.5)}</option>
          </React.Fragment>)}
        </select>
      </div>
    </div>

    <div>
      <Link onClick={() => setShowChangePassword(true)}>Change Password</Link>
      {showChangePassword && <ChangePasswordForm/>}
    </div>
  </div>
}

export function ChangePasswordForm() {
  const classes = useJssStyles("ChangePasswordForm", () => ({
    button: {},
    form: {},
  }));
  const [oldPassword,setOldPassword] = useState("");
  const [newPassword,setNewPassword] = useState("");
  const [confirmPassword,setConfirmPassword] = useState("");
  const [displayedError,setDisplayedError] = useState<string|null>(null);
  
  async function changePassword() {
    setDisplayedError(null);
    
    if (newPassword !== confirmPassword) {
      setDisplayedError("Passwords do not match");
      return;
    }
    
    const response = await doPost<ApiTypes.ApiChangePassword>({
      endpoint: "/api/users/changePassword",
      query: {},
      body: { oldPassword, newPassword },
    });
    
    if (response.error) {
      setDisplayedError(response.error)
    } else {
      redirect("/login");
    }
  }

  return <form
    className={classes.form}
    onSubmit={(ev) => {ev.preventDefault(); void changePassword()}}
  >
    <TextInput
      label="Current Password" inputType="password"
      value={oldPassword} setValue={setOldPassword}
    />
    <TextInput
      label="New Password" inputType="password"
      value={newPassword} setValue={setNewPassword}
    />
    <TextInput
      label="Confirm  Password" inputType="password"
      value={confirmPassword} setValue={setConfirmPassword}
    />
    <input type="submit" value="Submit" className={classes.button}/>

    {displayedError && <ErrorMessage message={displayedError}/>}
  </form>
}

export const components = {UserConfiguration,ChangePasswordForm};
