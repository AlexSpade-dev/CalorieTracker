import React, { useMemo, useState } from 'react';
import {
  SafeAreaView, View, Text, TextInput, Pressable, ScrollView,
  StyleSheet, StatusBar, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { COLORS } from './src/theme/theme';

const recipes = [
  { name: 'Mediterranean Lemon Herb Salmon', kcal: 580, protein: 42, carbs: 45, fat: 18, time: '25 min', tag: 'High Protein' },
  { name: 'Avocado & Poached Egg Toast', kcal: 340, protein: 18, carbs: 29, fat: 17, time: '15 min', tag: 'Quick Prep' },
  { name: 'Zesty Lime Chicken Quinoa', kcal: 465, protein: 39, carbs: 48, fat: 12, time: '20 min', tag: 'High Protein' },
  { name: 'Blueberry Chia Superfood Parfait', kcal: 290, protein: 14, carbs: 36, fat: 9, time: '10 min', tag: 'Vegan' },
];
const initialMeals = [
  { id: 1, meal: 'Breakfast', name: 'Greek Yogurt & Mixed Berries', kcal: 320 },
  { id: 2, meal: 'Lunch', name: 'Grilled Chicken Power Bowl', kcal: 540 },
  { id: 3, meal: 'Snack', name: 'Almonds & Apple', kcal: 180 },
];
function Button({ title, onPress, secondary=false, style }) {
  return <Pressable onPress={onPress} style={[styles.button, secondary && styles.secondaryButton, style]}><Text style={[styles.buttonText, secondary && styles.secondaryButtonText]}>{title}</Text></Pressable>;
}
function Field({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType }) {
  return <View style={styles.fieldWrap}><Text style={styles.label}>{label}</Text><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={COLORS.muted} secureTextEntry={secureTextEntry} keyboardType={keyboardType || 'default'} style={styles.input}/></View>;
}
function Card({ children, style }) { return <View style={[styles.card, style]}>{children}</View>; }
function Metric({ label, value, unit, color=COLORS.primary }) {
  return <Card style={styles.metric}><Text style={styles.muted}>{label}</Text><Text style={[styles.metricValue,{color}]}>{value}<Text style={styles.unit}> {unit}</Text></Text></Card>;
}
export default function App() {
  const [screen,setScreen] = useState('welcome');
  const [tab,setTab] = useState('Log');
  const [name,setName] = useState('');
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [age,setAge] = useState('26');
  const [height,setHeight] = useState('178');
  const [weight,setWeight] = useState('74.5');
  const [target,setTarget] = useState('70');
  const [sex,setSex] = useState('Male');
  const [goal,setGoal] = useState('2200');
  const [meals,setMeals] = useState(initialMeals);
  const [water,setWater] = useState(1250);
  const [search,setSearch] = useState('');
  const [filter,setFilter] = useState('All');
  const [period,setPeriod] = useState('Week');
  const [showQuick,setShowQuick] = useState(false);
  const [foodName,setFoodName] = useState('');
  const [foodKcal,setFoodKcal] = useState('250');
  const consumed = meals.reduce((n,m)=>n+m.kcal,0);
  const remaining = Math.max(0,Number(goal)-consumed);
  const visibleRecipes = useMemo(()=>recipes.filter(r=>(filter==='All'||r.tag===filter|| (filter==='Low Calorie'&&r.kcal<400)) && r.name.toLowerCase().includes(search.toLowerCase())),[filter,search]);
  const addMeal = (item) => { setMeals(old=>[...old,{...item,id:Date.now(),meal:'Snack'}]); setShowQuick(false); setFoodName(''); setFoodKcal('250'); Alert.alert('Added to your log',`${item.name} · ${item.kcal} kcal`); };
  const logRecipe = r => addMeal({name:r.name,kcal:r.kcal});
  const goDashboard = t => {setTab(t);setScreen('dashboard');};
  const heading = (title,sub) => <View style={styles.heading}><Text style={styles.h1}>{title}</Text>{sub ? <Text style={styles.muted}>{sub}</Text>:null}</View>;

  const authScreen = screen==='welcome'||screen==='login'||screen==='signup1'||screen==='signup2';
  return <SafeAreaView style={styles.safe}>
    <StatusBar barStyle="light-content" backgroundColor={COLORS.bg}/>
    {authScreen ? <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':undefined}>
      <ScrollView contentContainerStyle={styles.authContent} keyboardShouldPersistTaps="handled">
        <View style={styles.logo}><Text style={styles.logoText}>CalorieTracker<Text style={{color:COLORS.primary}}>+</Text></Text></View>
        {screen==='welcome' ? <>
          <View style={styles.hero}><Text style={styles.eyebrow}>PRECISION METABOLIC INTELLIGENCE</Text><Text style={styles.heroTitle}>Your health,{"\n"}in balance.</Text><Text style={styles.body}>Master your nutrition with scientific clarity. Track calories, understand your macros, and build healthier habits.</Text></View>
          <Button title="Get started  →" onPress={()=>setScreen('signup1')}/>
          <Button title="I already have an account" secondary onPress={()=>setScreen('login')}/>
        </> : screen==='login' ? <>
          {heading('Welcome back','Log in to continue your health journey.')}
          <Field label="Email address" value={email} onChangeText={setEmail} placeholder="alex@example.com" keyboardType="email-address"/>
          <Field label="Password" value={password} onChangeText={setPassword} placeholder="Your password" secureTextEntry/>
          <Button title="Log In  →" onPress={()=>{if(!email||!password)Alert.alert('Missing details','Enter your email and password.');else goDashboard('Log')}}/>
          <Button title="Create an account" secondary onPress={()=>setScreen('signup1')}/>
        </> : screen==='signup1' ? <>
          {heading('Start Your Health Journey','Step 1 of 2 · Account & daily goal')}
          <Field label="Full name" value={name} onChangeText={setName} placeholder="e.g. Alex Morgan"/>
          <Field label="Email address" value={email} onChangeText={setEmail} placeholder="alex@example.com" keyboardType="email-address"/>
          <Field label="Password" value={password} onChangeText={setPassword} placeholder="Create a strong password" secureTextEntry/>
          <Text style={styles.label}>Daily calorie target</Text>
          <View style={styles.wrap}>{['1800','2200','2600'].map((v,i)=><Pressable key={v} onPress={()=>setGoal(v)} style={[styles.choice,goal===v&&styles.choiceActive]}><Text style={styles.choiceText}>{v} kcal</Text><Text style={styles.mutedSmall}>{['Deficit','Optimal','Surplus'][i]}</Text></Pressable>)}</View>
          <Button title="Next  →" onPress={()=>{if(!name||!email||!password)Alert.alert('Complete your details','Please enter your name, email and password.');else setScreen('signup2')}}/>
          <Button title="Back to login" secondary onPress={()=>setScreen('login')}/>
        </> : <>
          {heading('Physical Stats & Targets','Step 2 of 2 · Personalize your metabolic burn rate')}
          <Text style={styles.label}>Biological sex</Text><View style={styles.wrap}>{['Male','Female'].map(v=><Pressable key={v} onPress={()=>setSex(v)} style={[styles.choice,{flex:1},sex===v&&styles.choiceActive]}><Text style={styles.choiceText}>{v}</Text></Pressable>)}</View>
          <Field label="Age" value={age} onChangeText={setAge} keyboardType="numeric" placeholder="26"/>
          <Field label="Height (cm)" value={height} onChangeText={setHeight} keyboardType="numeric" placeholder="178"/>
          <Field label="Current weight (kg)" value={weight} onChangeText={setWeight} keyboardType="decimal-pad" placeholder="74.5"/>
          <Field label="Target weight (kg)" value={target} onChangeText={setTarget} keyboardType="decimal-pad" placeholder="70"/>
          <Button title="Complete registration  →" onPress={()=>goDashboard('Log')}/>
          <Button title="Skip to dashboard" secondary onPress={()=>goDashboard('Log')}/>
        </>}
      </ScrollView>
    </KeyboardAvoidingView> : <>
      <View style={styles.topbar}><Text style={styles.logoText}>CalorieTracker<Text style={{color:COLORS.primary}}>+</Text></Text><Text style={styles.avatar}>{(name||'A').slice(0,1).toUpperCase()}</Text></View>
      <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        {tab==='Log' ? <>
          {heading(`Good morning${name?', '+name.split(' ')[0]:''} 👋`,"Here's your nutrition overview for today.")}
          <Card>
            <Text style={styles.label}>DAILY CALORIE INTAKE</Text>
            <View style={styles.calorieRow}><Text style={styles.bigNumber}>{consumed.toLocaleString()}</Text><Text style={styles.muted}> / {goal} kcal</Text></View>
            <View style={styles.progress}><View style={[styles.progressFill,{width:`${Math.min(100,consumed/Number(goal)*100)}%`}]}/></View>
            <View style={styles.rowBetween}><Text style={styles.muted}>{remaining.toLocaleString()} kcal remaining</Text><Text style={styles.primaryText}>{Math.round(consumed/Number(goal)*100)}%</Text></View>
          </Card>
          <View style={styles.row}><Metric label="Protein" value="62" unit="g"/><Metric label="Carbs" value="84" unit="g"/><Metric label="Fat" value="28" unit="g"/></View>
          {heading("Today's Meals","Your food entries for today")}
          {meals.map(m=><Card key={m.id} style={styles.meal}><View style={{flex:1}}><Text style={styles.mutedSmall}>{m.meal}</Text><Text style={styles.cardTitle}>{m.name}</Text></View><Text style={styles.primaryText}>{m.kcal} kcal</Text></Card>)}
          <Button title="+  Quick add food" onPress={()=>setShowQuick(true)}/>
          {heading('Hydration','Daily water goal · 2,500 ml')}
          <Card><View style={styles.rowBetween}><Text style={styles.cardTitle}>💧 {water.toLocaleString()} ml</Text><Text style={styles.primaryText}>{Math.round(water/2500*100)}%</Text></View><View style={styles.progress}><View style={[styles.progressFill,{width:`${Math.min(100,water/25)}%`} ]}/></View><View style={styles.wrap}>{[250,500,750,1000].map(v=><Pressable key={v} style={styles.waterBtn} onPress={()=>setWater(w=>w+v)}><Text style={styles.primaryText}>+{v}ml</Text></Pressable>)}</View></Card>
        </> : tab==='Recipes' ? <>
          {heading('Recipe Browser','Discover meals that fit your goals.')}
          <TextInput value={search} onChangeText={setSearch} placeholder="Search healthy recipes..." placeholderTextColor={COLORS.muted} style={styles.input}/>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginVertical:12}}>{['All','High Protein','Low Calorie','Quick Prep','Vegan'].map(f=><Pressable key={f} onPress={()=>setFilter(f)} style={[styles.chip,filter===f&&styles.chipActive]}><Text style={styles.chipText}>{f}</Text></Pressable>)}</ScrollView>
          {visibleRecipes.map(r=><Card key={r.name} style={styles.recipe}><View style={styles.recipeArt}><Text style={{fontSize:34}}>🥗</Text></View><Text style={styles.cardTitle}>{r.name}</Text><Text style={styles.muted}>{r.kcal} kcal  ·  {r.time}  ·  {r.protein}g protein</Text><View style={styles.rowBetween}><Text style={styles.primaryText}>{r.tag}</Text><Button title="Add to Log" onPress={()=>logRecipe(r)} style={{paddingVertical:9,paddingHorizontal:16}}/></View></Card>)}
        </> : <>
          {heading('Analytics & Trends','Your progress at a glance.')}
          <View style={styles.wrap}>{['Day','Week','Month','Year'].map(v=><Pressable key={v} onPress={()=>setPeriod(v)} style={[styles.chip,period===v&&styles.chipActive]}><Text style={styles.chipText}>{v}</Text></Pressable>)}</View>
          <Card><Text style={styles.label}>CALORIE INTAKE · {period.toUpperCase()}</Text><Text style={styles.bigNumber}>{consumed.toLocaleString()} <Text style={styles.unit}>kcal today</Text></Text><View style={styles.barChart}>{[48,72,58,88,64,78,consumed/Number(goal)*100].map((v,i)=><View key={i} style={styles.barCol}><View style={[styles.bar,{height:Math.max(12,Math.min(100,v))}]}/><Text style={styles.mutedSmall}>{['M','T','W','T','F','S','S'][i]}</Text></View>)}</View></Card>
          <View style={styles.row}><Metric label="Avg. calories" value="1,940" unit="kcal"/><Metric label="Daily deficit" value="260" unit="kcal"/></View>
          <Card><Text style={styles.cardTitle}>Macronutrient Distribution</Text><View style={styles.macroLine}><Text style={styles.muted}>Protein</Text><Text style={styles.primaryText}>30%</Text></View><View style={styles.progress}><View style={[styles.progressFill,{width:'30%'}]}/></View><View style={styles.macroLine}><Text style={styles.muted}>Carbohydrates</Text><Text style={styles.primaryText}>45%</Text></View><View style={styles.progress}><View style={[styles.progressFill,{width:'45%'}]}/></View><View style={styles.macroLine}><Text style={styles.muted}>Fat</Text><Text style={styles.primaryText}>25%</Text></View><View style={styles.progress}><View style={[styles.progressFill,{width:'25%'}]}/></View></Card>
        </>}
      </ScrollView>
      <View style={styles.bottomNav}>{['Log','Recipes','Analytics','Profile'].map((v,i)=><Pressable key={v} onPress={()=>v==='Profile'?Alert.alert('Profile','Profile settings are not included in the supplied HTML pages yet.'):setTab(v)} style={styles.navItem}><Text style={[styles.navIcon,tab===v&&styles.primaryText]}>{['◉','▤','▥','●'][i]}</Text><Text style={[styles.navLabel,tab===v&&styles.primaryText]}>{v}</Text></Pressable>)}</View>
      {showQuick&&<View style={styles.overlay}><Card style={styles.modal}><Text style={styles.h2}>Quick add food</Text><Field label="Food name" value={foodName} onChangeText={setFoodName} placeholder="e.g. Banana"/><Field label="Calories (kcal)" value={foodKcal} onChangeText={setFoodKcal} keyboardType="numeric" placeholder="250"/><Button title="Add to today's log" onPress={()=>{if(!foodName.trim()||!Number(foodKcal))return Alert.alert('Enter food details');addMeal({name:foodName.trim(),kcal:Number(foodKcal)})}}/><Button title="Cancel" secondary onPress={()=>setShowQuick(false)}/></Card></View>}
    </>}
  </SafeAreaView>;
}

const styles = StyleSheet.create({
 safe:{flex:1,backgroundColor:COLORS.bg}, authContent:{flexGrow:1,padding:24,justifyContent:'center',paddingBottom:40},
 logo:{alignItems:'center',marginBottom:36},logoText:{fontSize:22,fontWeight:'800',color:COLORS.text,letterSpacing:-.5},
 hero:{marginBottom:34},eyebrow:{color:COLORS.primary,fontSize:10,fontWeight:'800',letterSpacing:2,marginBottom:14},
 heroTitle:{fontSize:44,lineHeight:49,fontWeight:'800',color:COLORS.text,marginBottom:16},body:{fontSize:15,lineHeight:24,color:COLORS.muted},
 heading:{marginBottom:20},h1:{fontSize:26,fontWeight:'800',color:COLORS.text,marginBottom:5},h2:{fontSize:22,fontWeight:'800',color:COLORS.text,marginBottom:18},
 muted:{fontSize:13,color:COLORS.muted},mutedSmall:{fontSize:11,color:COLORS.muted},label:{fontSize:11,fontWeight:'700',color:COLORS.muted,marginBottom:8,letterSpacing:.5},
 fieldWrap:{marginBottom:16},input:{backgroundColor:COLORS.surface,borderWidth:1,borderColor:COLORS.border,borderRadius:12,paddingHorizontal:14,paddingVertical:13,color:COLORS.text,fontSize:14,marginBottom:4},
 button:{backgroundColor:COLORS.primaryStrong,borderRadius:14,paddingVertical:15,paddingHorizontal:18,alignItems:'center',justifyContent:'center',marginTop:10},
 buttonText:{color:'#06172b',fontSize:14,fontWeight:'800'},secondaryButton:{backgroundColor:COLORS.surface,borderWidth:1,borderColor:COLORS.border},secondaryButtonText:{color:COLORS.text},
 safeArea:{flex:1},topbar:{height:58,paddingHorizontal:20,flexDirection:'row',alignItems:'center',justifyContent:'space-between',borderBottomWidth:1,borderBottomColor:COLORS.border},
 avatar:{width:34,height:34,borderRadius:17,backgroundColor:COLORS.surface2,color:COLORS.primary,textAlign:'center',textAlignVertical:'center',fontWeight:'800',overflow:'hidden',paddingTop:8},
 page:{padding:18,paddingBottom:30},card:{backgroundColor:COLORS.surface,borderWidth:1,borderColor:COLORS.border,borderRadius:18,padding:17,marginBottom:14},
 calorieRow:{flexDirection:'row',alignItems:'baseline',marginTop:8,marginBottom:12},bigNumber:{fontSize:36,fontWeight:'800',color:COLORS.text},progress:{height:8,backgroundColor:COLORS.border,borderRadius:10,overflow:'hidden',marginVertical:10},progressFill:{height:'100%',backgroundColor:COLORS.primary,borderRadius:10},
 row:{flexDirection:'row',gap:10},rowBetween:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},metric:{flex:1,padding:13},metricValue:{fontSize:23,fontWeight:'800',marginTop:7},unit:{fontSize:11,color:COLORS.muted,fontWeight:'600'},primaryText:{color:COLORS.primary,fontWeight:'800',fontSize:13},
 meal:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:10},cardTitle:{fontSize:14,fontWeight:'700',color:COLORS.text,marginVertical:4},
 wrap:{flexDirection:'row',flexWrap:'wrap',gap:8,marginVertical:10},choice:{backgroundColor:COLORS.surface,borderWidth:1,borderColor:COLORS.border,borderRadius:12,padding:13,minWidth:'29%',alignItems:'center'},choiceActive:{borderColor:COLORS.primary,backgroundColor:'#102b48'},choiceText:{color:COLORS.text,fontWeight:'700',fontSize:13},
 waterBtn:{paddingVertical:9,paddingHorizontal:12,borderRadius:10,backgroundColor:COLORS.surface2,borderWidth:1,borderColor:COLORS.border},
 chip:{paddingVertical:9,paddingHorizontal:13,borderRadius:20,backgroundColor:COLORS.surface2,borderWidth:1,borderColor:COLORS.border,marginRight:7},chipActive:{backgroundColor:'#12415b',borderColor:COLORS.primary},chipText:{color:COLORS.text,fontSize:12,fontWeight:'700'},
 recipe:{padding:14},recipeArt:{height:100,borderRadius:12,backgroundColor:'#1d3150',alignItems:'center',justifyContent:'center',marginBottom:10},
 bottomNav:{height:66,backgroundColor:COLORS.surface,borderTopWidth:1,borderTopColor:COLORS.border,flexDirection:'row',justifyContent:'space-around',alignItems:'center',paddingBottom:5},
 navItem:{alignItems:'center',justifyContent:'center',flex:1},navIcon:{fontSize:19,color:COLORS.muted},navLabel:{fontSize:10,color:COLORS.muted,marginTop:3,fontWeight:'700'},
 barChart:{height:145,flexDirection:'row',alignItems:'flex-end',justifyContent:'space-around',marginTop:20},barCol:{alignItems:'center',justifyContent:'flex-end',height:'100%',gap:8},bar:{width:20,backgroundColor:COLORS.primary,borderRadius:6,minHeight:10},macroLine:{flexDirection:'row',justifyContent:'space-between',marginTop:12},
 overlay:{position:'absolute',top:0,bottom:0,left:0,right:0,backgroundColor:'rgba(0,0,0,.72)',justifyContent:'center',padding:20},modal:{padding:20},
});
