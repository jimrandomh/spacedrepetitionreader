import React, { useState } from 'react'
import DatePicker from "react-datepicker";
import { useJssStyles } from '../lib/useJssStyles';
import { useLocation } from "../lib/useLocation";
import { Button, Link } from "./widgets";

interface DebugOptions {
  overrideDate: Date|null
}

export function DebugPanel({onClose}: {
  onClose: ()=>void
}) {
  const classes = useJssStyles("DebugPanel", () => ({
    simulatedDate: {
    },
    datePicker: {
      display: "inline-block",
      marginRight: 8,
    },
  }));

  const initialDebugOptions = useDebugOptions();
  const location = useLocation();
  const [debugOptions,setDebugOptions] = useState(initialDebugOptions);
  const [hasChanges,setHasChanges] = useState(false);

  function confirmAndClose() {
    if (hasChanges) {
      const oldParams = Object.fromEntries(location.query.entries());
      const newParams = new URLSearchParams(mergeParams(oldParams, debugOptionsToQueryParams(debugOptions)));
      
      const newUrl = stripSearchParams(location.url) + ([...newParams.keys()].length ? ("?"+newParams.toString()) : "");
      window.location.assign(newUrl);
    } else {
      onClose();
    }
  }
  
  function setDebugOption(option: Partial<DebugOptions>) {
    setDebugOptions({
      ...debugOptions,
      ...option
    });
    setHasChanges(true);
  }
  
  function clearOverrideDate() {
    setDebugOption({ overrideDate: null, });
  }

  return <div>
    <h2>Debug Options</h2>
    
    <div className={classes.simulatedDate}>
      Simulated date:{' '}
      <div className={classes.datePicker}>
        <DatePicker
          selected={debugOptions.overrideDate}
          showTimeSelect
          onChange={(date) => {
            setDebugOption({ overrideDate: date, });
          }}
        />
      </div>
      <Link onClick={clearOverrideDate}>Clear</Link>
    </div>
    
    <div>
      <Button label="Close" onClick={confirmAndClose}/>
    </div>
  </div>
}

export function useDebugOptions(): DebugOptions {
  const { query } = useLocation();
  const overrideDate = query.get('overrideDate') ? new Date(query.get('overrideDate')!) : null;
  return { overrideDate };
}

function debugOptionsToQueryParams(debugOptions: DebugOptions): Partial<Record<string,string|null>> {
  if (debugOptions.overrideDate) {
    return {overrideDate: debugOptions.overrideDate.toISOString()};
  } else {
    return {overrideDate:null};
  }
}

function mergeParams(a: Partial<Record<string,string|null>>, b: Partial<Record<string,string|null>>): Record<string,string> {
  const result = {...a};
  for (const k of Object.keys(b)) {
    result[k] = b[k];
  }
  for (const k of Object.keys(result)) {
    if (result[k]===null)
      delete result[k];
  }
  return result as Record<string,string>;
}

/// Removes search params from a URI, if present. Eg
///   "http://localhost:3000/?x=1" -> "http://localhost:3000/"
function stripSearchParams(url: string): string {
  const urlObject = new URL(url);
  urlObject.search = "";
  return urlObject.toString();
}

export const components = {DebugPanel};
