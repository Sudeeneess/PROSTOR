import React from "react";
import { useNavigate } from "react-router-dom";
import HeaderSeller from "./HeaderSeller";
import styles from './MainSeller.module.css';

const MainSeller: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={styles['seller-page']}>
      <HeaderSeller />

      <div className={styles['seller-wrapper']}>
        {/* Р›Р•Р’Рћ */}
        <div className={styles['left-block']}>
          <h1>РџСЂРѕСЃС‚РѕСЂ РґР»СЏ РІР°С€РµРіРѕ Р±РёР·РЅРµСЃР°</h1>

          <p className={styles['desc']}>
            РќР°С‡РЅРёС‚Рµ РїСЂРѕРґР°РІР°С‚СЊ РЅР° РјР°СЂРєРµС‚РїР»РµР№СЃРµ СЃ СѓРґРѕР±РЅРѕР№ СЃРёСЃС‚РµРјРѕР№ СѓРїСЂР°РІР»РµРЅРёСЏ
            С‚РѕРІР°СЂР°РјРё Рё Р·Р°РєР°Р·Р°РјРё
          </p>

          <button
            className={styles['start-btn']}
            onClick={() => navigate("/seller/register")}
          >
            РќР°С‡Р°С‚СЊ РїСЂРѕРґР°РІР°С‚СЊ
          </button>

          <div className={styles['benefits']}>
            <div> вЂў РџСЂРѕСЃС‚Р°СЏ Р°РЅР°Р»РёС‚РёРєР°</div>
            <div> вЂў Р’С‹РіРѕРґРЅС‹Рµ СѓСЃР»РѕРІРёСЏ</div>
            <div> вЂў Р‘РµР·РѕРїР°СЃРЅС‹Рµ СЃРґРµР»РєРё</div>
          </div>
        </div>

        {/* РџР РђР’Рћ */}
        <div className={styles['right-block']}>
          <h2>РљР°Рє СЌС‚Рѕ СЂР°Р±РѕС‚Р°РµС‚</h2>

          <div className={styles['steps']}>
            <div>
              <b>1. Р РµРіРёСЃС‚СЂР°С†РёСЏ</b>
              <p>РЎРѕР·РґР°Р№С‚Рµ Р°РєРєР°СѓРЅС‚ РїСЂРѕРґР°РІС†Р°</p>
            </div>

            <div>
              <b>2. Р”РѕР±Р°РІР»РµРЅРёРµ С‚РѕРІР°СЂРѕРІ</b>
              <p>Р—Р°РіСЂСѓР·РёС‚Рµ РєР°С‚Р°Р»РѕРі</p>
            </div>

            <div>
              <b>3. РЈРїСЂР°РІР»РµРЅРёРµ РїСЂРѕРґР°Р¶Р°РјРё</b>
              <p>РџСЂРёРЅРёРјР°Р№С‚Рµ Р·Р°РєР°Р·С‹</p>
            </div>

            <div>
              <b>4. Р’С‹РІРѕРґ СЃСЂРµРґСЃС‚РІ</b>
              <p>РџРѕР»СѓС‡Р°Р№С‚Рµ РѕРїР»Р°С‚Сѓ</p>
            </div>
          </div>

          {/* РћРўР—Р«Р’ */}
          <div className={styles['review']}>
            вЂњРџРѕРґРєР»СЋС‡РёР»СЃСЏ Р·Р° РґРµРЅСЊ, РїРµСЂРІС‹Рµ Р·Р°РєР°Р·С‹ С‡РµСЂРµР· 2 РґРЅСЏвЂќ
            <span>вЂ” РћРћРћ вЂњР’РµРєС‚РѕСЂвЂќ, РїСЂРѕРґР°С‘С‚ СЃ 2023</span>
          </div>

          {/* FAQ */}
          <div className={styles['faq']}>
            <h3>FAQ (С‡Р°СЃС‚С‹Рµ РІРѕРїСЂРѕСЃС‹)</h3>

            <div className={styles['faq-item']}>
              <b>РЎРєРѕР»СЊРєРѕ СЃС‚РѕРёС‚ РїРѕРґРєР»СЋС‡РµРЅРёРµ?</b>
              <p>Р‘РµСЃРїР»Р°С‚РЅРѕ</p>
            </div>

            <div className={styles['faq-item']}>
              <b>РљРѕРіРґР° РЅР°С‡РЅСѓС‚СЃСЏ РїСЂРѕРґР°Р¶Рё?</b>
              <p>РћР±С‹С‡РЅРѕ РІ С‚РµС‡РµРЅРёРµ 1-3 РґРЅРµР№</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainSeller;