import range from 'lodash/range';
import React, { useState } from 'react';
import { doPost } from '../lib/apiUtil';
import { redirect } from '../lib/util/browserUtil';
import { useCurrentUser } from "../lib/useCurrentUser";
import { useJssStyles } from "../lib/useJssStyles";
import { formatTimeInHours, getUserOptions, UserOptions } from '../lib/userOptions';
import { getTimezonesList } from '../lib/util/timeUtil';
import { Button, Checkbox, Dropdown, ErrorMessage, Link, TextInput } from "./widgets";
import { feedPresentationOrderLabels, getSubscriptionOptions, SubscriptionOptions } from '../lib/subscriptionOptions';
import { ModalDialog, useModal } from '../lib/useModal';


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
  const selectedTimezone = timezones.find(tz=>tz.name===currentOptions.timezone);
  
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
          value={selectedTimezone?.label}
          onChange={ev => {
            const newTimezone = timezones.find(tz=>tz.label===ev.target.value);
            void updateOptions({
              timezone: newTimezone!.name
            })
          }}
        >
          {timezones.map(tz =>
            <option
              key={tz.name}
            >
              {tz.label}
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

function ChangePasswordForm() {
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

export function SubscriptionSettingsForm({subscription, categories, disabled}: {
  subscription: ApiTypes.ApiObjSubscription
  categories: string[]
  disabled: boolean
}) {
  const classes = useJssStyles("SubscriptionSettingsForm", () => ({
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
  }));
  const {openModal} = useModal();
  const [currentOptions,setCurrentOptions] = useState(getSubscriptionOptions(subscription));
  
  async function updateOptions(options: Partial<SubscriptionOptions>) {
    const mergedOptions = {...currentOptions, ...options};
    setCurrentOptions(mergedOptions);
    
    const {result:_r, error:_e} = await doPost<ApiTypes.ApiEditSubscriptionOptions>({
      endpoint: "/api/feeds/edit",
      query: {},
      body: {
        subscriptionId: subscription.id,
        config: mergedOptions
      },
    });
  }

  const feedCategories: Record<string,string> = {};
  feedCategories["Uncategorized"] = "Uncategorized";
  for (const category of categories) {
    feedCategories[category] = category;
  }
  feedCategories["New Category"] = "New Category";

  return <div>
    <div className={classes.twoColumnSetting}>
      <div className={classes.label}>Reading order</div>
      <div className={classes.optionColumn}>
        <Dropdown
          optionsAndLabels={feedPresentationOrderLabels}
          value={currentOptions.presentationOrder}
          setValue={order => updateOptions({
            presentationOrder: order
          })}
        />
      </div>
    </div>
    <div className={classes.twoColumnSetting}>
      <div className={classes.label}>Category</div>
      <div className={classes.optionColumn}>
        <Dropdown
          optionsAndLabels={feedCategories}
          value={currentOptions.category ?? ""}
          setValue={category => {
            switch(category) {
              case "Uncategorized":
                void updateOptions({
                  category: undefined
                })
                break;
              case "New Category":
                openModal({
                  fn: (onClose) => {
                    return <SetFeedCategoryDialog
                      setCategory={(newCategory: string|undefined) => updateOptions({
                        category: newCategory
                      })}
                      onClose={onClose}
                    />
                  }
                });
                break;
              default:
                void updateOptions({ category });
                break;
            }
          }}
        />
      </div>
    </div>
    <Checkbox
      label="Include feed items in reviews"
      value={currentOptions.shuffleIntoReviews}
      setValue={checked => updateOptions({ shuffleIntoReviews: checked })}
    />
    
    <Checkbox
      label="Block access if I have unreviewed cards"
      value={currentOptions.blockDirectAccess}
      setValue={checked => updateOptions({ blockDirectAccess: checked })}
      disabled={disabled}
    />
  </div>;
}

function SetFeedCategoryDialog({ setCategory, onClose }: {
  setCategory: (newCategory: string|undefined)=>void
  onClose: ()=>void
}) {
  const classes = useJssStyles("SetFeedCategoryDialog", () => ({
    input: {
    },
  }));

  const [categoryState,setCategoryState] = useState("");

  return <ModalDialog>
    <h2>Category</h2>
    
    <input className={classes.input}
      value={categoryState}
      onChange={ev => setCategoryState(ev.target.value)}
    />
    
    <div>
      <Button
        label="Ok"
        onClick={() => {
          setCategory(categoryState);
          onClose();
        }}
      />
      <Button
        label="Cancel"
        onClick={onClose}
      />
    </div>
  </ModalDialog>
}


export const components = {UserConfiguration,ChangePasswordForm,SubscriptionSettingsForm,SetFeedCategoryDialog};
